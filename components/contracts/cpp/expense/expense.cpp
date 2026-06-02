// expense.cpp — шасси расходов (MVP: Благорост).
//
// Принцип: контракт-владелец расходных операций, агностичен к программе-источнику.
// operation_code передаётся в createexp; callback-handler сохраняется как переменная;
// все ledger2-проводки идут через Ledger2::apply на коды из OPERATION_REGISTRY.

#include "expense.hpp"

namespace D = ExpenseDomain;

// ── helpers ──────────────────────────────────────────────────────────────────

namespace {

asset zero_like(const asset& a) { return asset{0, a.symbol}; }

asset sum_planned(const std::vector<D::item>& items) {
  if (items.empty()) return asset{0, eosio::symbol{"RUB", 4}};
  asset total = zero_like(items.front().planned_amount);
  for (const auto& it : items) total += it.planned_amount;
  return total;
}

void check_operation_code(eosio::name code) {
  // На MVP принимаем только зарегистрированные коды expense из ledger2 OPERATION_REGISTRY.
  eosio::check(
    code == operations::expense::BLAGO_ADVANCE ||
    code == operations::expense::BLAGO_DIRECT,
    "operation_code должен быть o.exp.blgadv или o.exp.blgdir на этапе payexp/createexp"
  );
}

D::proposals_index get_proposals(eosio::name self, eosio::name coopname) {
  return D::proposals_index(self, coopname.value);
}

auto find_proposal(D::proposals_index& tbl, const eosio::checksum256& proposal_hash) {
  auto idx = tbl.get_index<"byhash"_n>();
  return idx.find(proposal_hash);
}

void send_callback_if_any(const D::callback_handler& cb,
                          const eosio::checksum256& proposal_hash,
                          const eosio::asset& amount,
                          eosio::name self) {
  if (cb.contract.value == 0) return;
  eosio::action(
    eosio::permission_level{self, "active"_n},
    cb.contract,
    cb.action,
    std::make_tuple(proposal_hash, amount, cb.data)
  ).send();
}

} // namespace

// ── actions ──────────────────────────────────────────────────────────────────

void expense::createexp(name coopname, name username,
                        checksum256 proposal_hash,
                        name operation_code,
                        name source_wallet,
                        std::vector<D::item> items,
                        D::callback_handler callback,
                        document2 statement) {
  require_auth(coopname);

  verify_document_or_fail(statement, {username});
  check_operation_code(operation_code);
  eosio::check(!items.empty(), "СЗ должен содержать хотя бы один item");
  eosio::check(ledger2_is_known_wallet(source_wallet),
               "source_wallet не найден в LEDGER2_WALLET_REGISTRY");

  auto tbl = get_proposals(get_self(), coopname);
  eosio::check(find_proposal(tbl, proposal_hash) == tbl.get_index<"byhash"_n>().end(),
               "СЗ с таким proposal_hash уже существует");

  const auto total = sum_planned(items);

  for (auto& it : items) {
    it.status        = static_cast<uint8_t>(D::ItemStatus::APPROVED);
    it.actual_amount = zero_like(it.planned_amount);
  }

  tbl.emplace(get_self(), [&](auto& row) {
    row.id              = tbl.available_primary_key();
    row.proposal_hash   = proposal_hash;
    row.username        = username;
    row.operation_code  = operation_code;
    row.source_wallet   = source_wallet;
    row.status          = static_cast<uint8_t>(D::ProposalStatus::CREATED);
    row.items           = items;
    row.total_planned   = total;
    row.total_actual    = zero_like(total);
    row.callback        = callback;
    row.statement_doc   = statement;
    row.decision_doc    = document2{};
    row.created_at      = eosio::current_time_point();
    row.updated_at      = row.created_at;
  });
}

void expense::authexp(name coopname, checksum256 proposal_hash, document2 decision) {
  require_auth(coopname);

  auto tbl = get_proposals(get_self(), coopname);
  auto idx = tbl.get_index<"byhash"_n>();
  auto it  = idx.find(proposal_hash);
  eosio::check(it != idx.end(), "СЗ не найден");
  eosio::check(it->status == static_cast<uint8_t>(D::ProposalStatus::CREATED),
               "Авторизовать можно только СЗ в статусе CREATED");

  verify_document_or_fail(decision);

  idx.modify(it, get_self(), [&](auto& row) {
    row.decision_doc = decision;
    row.status       = static_cast<uint8_t>(D::ProposalStatus::AUTHORIZED);
    row.updated_at   = eosio::current_time_point();
  });
}

void expense::declexp(name coopname, checksum256 proposal_hash, std::string reason) {
  require_auth(coopname);

  auto tbl = get_proposals(get_self(), coopname);
  auto idx = tbl.get_index<"byhash"_n>();
  auto it  = idx.find(proposal_hash);
  eosio::check(it != idx.end(), "СЗ не найден");
  eosio::check(it->status != static_cast<uint8_t>(D::ProposalStatus::CLOSED),
               "Нельзя отклонить закрытый СЗ");

  idx.modify(it, get_self(), [&](auto& row) {
    row.status     = static_cast<uint8_t>(D::ProposalStatus::DECLINED);
    row.updated_at = eosio::current_time_point();
  });
}

void expense::payexp(name coopname, checksum256 proposal_hash, checksum256 item_hash,
                     asset actual_amount) {
  require_auth(coopname);

  auto tbl = get_proposals(get_self(), coopname);
  auto idx = tbl.get_index<"byhash"_n>();
  auto it  = idx.find(proposal_hash);
  eosio::check(it != idx.end(), "СЗ не найден");
  eosio::check(it->status == static_cast<uint8_t>(D::ProposalStatus::AUTHORIZED) ||
               it->status == static_cast<uint8_t>(D::ProposalStatus::PARTIALLY_PAID),
               "Оплата возможна только из статусов AUTHORIZED / PARTIALLY_PAID");

  bool item_found = false;
  D::Mechanics mech = D::Mechanics::ADVANCE;
  asset total_after = it->total_actual;

  idx.modify(it, get_self(), [&](auto& row) {
    for (auto& i : row.items) {
      if (i.item_hash == item_hash) {
        eosio::check(i.status == static_cast<uint8_t>(D::ItemStatus::APPROVED),
                     "Item уже оплачен или закрыт");
        i.actual_amount = actual_amount;
        i.status        = static_cast<uint8_t>(D::ItemStatus::PAID);
        mech            = static_cast<D::Mechanics>(i.mechanics);
        item_found      = true;
        break;
      }
    }
    eosio::check(item_found, "item с заданным hash не найден в СЗ");
    row.total_actual += actual_amount;
    row.status       = static_cast<uint8_t>(D::ProposalStatus::PARTIALLY_PAID);
    row.updated_at   = eosio::current_time_point();
    total_after      = row.total_actual;
  });

  // ledger2 проводка по operation_code из proposal — выдача аванса или прямая оплата.
  Ledger2::apply(get_self(), coopname, it->operation_code, actual_amount,
                 it->username, proposal_hash, "expense:payexp");

  // DIRECT — фоновый reportexp (закрываем подотчёт нулевым BURN, без чека от пайщика).
  if (mech == D::Mechanics::DIRECT) {
    // Для DIRECT нет ADVANCE_HOLD-кошелька, поэтому advrpt-BURN не применим.
    // DIRECT считается «закрытым» сразу после payexp: помечаем item REPORTED.
    idx.modify(it, get_self(), [&](auto& row) {
      for (auto& i : row.items) {
        if (i.item_hash == item_hash) {
          i.status = static_cast<uint8_t>(D::ItemStatus::REPORTED);
          break;
        }
      }
      row.updated_at = eosio::current_time_point();
    });
  }
}

void expense::reportexp(name coopname, checksum256 proposal_hash, checksum256 item_hash) {
  require_auth(coopname);

  auto tbl = get_proposals(get_self(), coopname);
  auto idx = tbl.get_index<"byhash"_n>();
  auto it  = idx.find(proposal_hash);
  eosio::check(it != idx.end(), "СЗ не найден");

  asset item_amount = asset{0, it->total_actual.symbol};
  bool item_found = false;
  bool all_reported = true;

  idx.modify(it, get_self(), [&](auto& row) {
    for (auto& i : row.items) {
      if (i.item_hash == item_hash) {
        eosio::check(i.status == static_cast<uint8_t>(D::ItemStatus::PAID),
                     "Отчёт возможен только для оплаченных items");
        eosio::check(static_cast<D::Mechanics>(i.mechanics) == D::Mechanics::ADVANCE,
                     "reportexp применим только к ADVANCE-механике");
        i.status   = static_cast<uint8_t>(D::ItemStatus::REPORTED);
        item_amount = i.actual_amount;
        item_found  = true;
      }
      if (i.status != static_cast<uint8_t>(D::ItemStatus::REPORTED) &&
          i.status != static_cast<uint8_t>(D::ItemStatus::RETURNED)) {
        all_reported = false;
      }
    }
    eosio::check(item_found, "item с заданным hash не найден в СЗ");
    if (all_reported) {
      row.status = static_cast<uint8_t>(D::ProposalStatus::REPORT_SUBMITTED);
    }
    row.updated_at = eosio::current_time_point();
  });

  // ledger2: BURN ADVANCE_HOLD, без бухпроводки — canal 08/51 уже сделан на blgadv.
  Ledger2::apply(get_self(), coopname, operations::expense::ADVANCE_REPORT, item_amount,
                 it->username, proposal_hash, "expense:reportexp");
}

void expense::closeexp(name coopname, checksum256 proposal_hash) {
  require_auth(coopname);

  auto tbl = get_proposals(get_self(), coopname);
  auto idx = tbl.get_index<"byhash"_n>();
  auto it  = idx.find(proposal_hash);
  eosio::check(it != idx.end(), "СЗ не найден");
  eosio::check(it->status == static_cast<uint8_t>(D::ProposalStatus::REPORT_SUBMITTED),
               "Закрыть можно только СЗ в статусе REPORT_SUBMITTED");

  idx.modify(it, get_self(), [&](auto& row) {
    row.status     = static_cast<uint8_t>(D::ProposalStatus::CLOSED);
    row.updated_at = eosio::current_time_point();
  });

  // Callback на финализацию (capital::onexpreport и т.п.) — если был установлен при createexp.
  send_callback_if_any(it->callback, proposal_hash, it->total_actual, get_self());
}

void expense::returnexp(name coopname, checksum256 proposal_hash, checksum256 item_hash,
                        asset return_amount) {
  require_auth(coopname);

  auto tbl = get_proposals(get_self(), coopname);
  auto idx = tbl.get_index<"byhash"_n>();
  auto it  = idx.find(proposal_hash);
  eosio::check(it != idx.end(), "СЗ не найден");

  bool item_found = false;

  idx.modify(it, get_self(), [&](auto& row) {
    for (auto& i : row.items) {
      if (i.item_hash == item_hash) {
        eosio::check(i.status == static_cast<uint8_t>(D::ItemStatus::PAID),
                     "Возврат возможен только из статуса PAID");
        eosio::check(return_amount.amount > 0 && return_amount.amount <= i.actual_amount.amount,
                     "return_amount должен быть положительным и не превышать actual_amount");
        i.actual_amount -= return_amount;
        i.status   = static_cast<uint8_t>(D::ItemStatus::RETURNED);
        item_found = true;
        break;
      }
    }
    eosio::check(item_found, "item с заданным hash не найден в СЗ");
    row.total_actual -= return_amount;
    row.updated_at   = eosio::current_time_point();
  });

  // ledger2: TRANSFER ADVANCE_HOLD → BLAGOROST_FUND, Dr 51 / Cr 08.
  Ledger2::apply(get_self(), coopname, operations::expense::ADVANCE_RETURN, return_amount,
                 it->username, proposal_hash, "expense:returnexp");
}

void expense::overspendexp(name coopname, checksum256 proposal_hash, checksum256 item_hash,
                           asset overspend_amount) {
  require_auth(coopname);
  eosio::check(overspend_amount.amount > 0, "overspend_amount должен быть положительным");

  auto tbl = get_proposals(get_self(), coopname);
  auto idx = tbl.get_index<"byhash"_n>();
  auto it  = idx.find(proposal_hash);
  eosio::check(it != idx.end(), "СЗ не найден");

  bool item_found = false;

  idx.modify(it, get_self(), [&](auto& row) {
    for (auto& i : row.items) {
      if (i.item_hash == item_hash) {
        eosio::check(i.status == static_cast<uint8_t>(D::ItemStatus::PAID),
                     "Перерасход регистрируется только из статуса PAID");
        eosio::check(static_cast<D::Mechanics>(i.mechanics) == D::Mechanics::ADVANCE,
                     "overspendexp применим только к ADVANCE-механике");
        i.actual_amount += overspend_amount;
        i.status   = static_cast<uint8_t>(D::ItemStatus::OVERSPENT);
        item_found = true;
        break;
      }
    }
    eosio::check(item_found, "item с заданным hash не найден в СЗ");
    row.total_actual += overspend_amount;
    row.updated_at   = eosio::current_time_point();
  });

  // ledger2: 1) OVERSPEND (выдача доплаты) → 2) ADVANCE_REPORT (закрытие подотчёта).
  Ledger2::apply(get_self(), coopname, operations::expense::OVERSPEND, overspend_amount,
                 it->username, proposal_hash, "expense:overspend");

  Ledger2::apply(get_self(), coopname, operations::expense::ADVANCE_REPORT, overspend_amount,
                 it->username, proposal_hash, "expense:overspend-report");
}
