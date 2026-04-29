/**
 * @brief Миграция остатков с legacy-ledger на ledger2 (пересмотр 2026-04-20).
 *
 * Разделение на два независимых потока:
 *
 *   A. **Бухгалтерские остатки** из `ledger::accounts` (scope=coopname,
 *      contract=_ledger) → через 4 inline `apply(operations::migration::*)`
 *      с полной двойной проводкой. Счета: 51 / 80 / 86 / 04.
 *
 *   B. **Программные кошельки** из `soviet::progwallets` (scope=coopname,
 *      contract=_soviet) → прямой `wallets2.emplace` в ledger2 БЕЗ
 *      бух-проводок. Legacy::accounts и soviet::progwallets — параллельные
 *      системы учёта, progwallet.blocked не проводится через 80-й счёт,
 *      поэтому любая попытка провести его через Dr 51 / Cr 80 вызовет
 *      двойной учёт на бухуровне. Вместо этого переносим только
 *      wallet-аналитику (w.cap.bginv BLAGOROST_INVEST, w.cap.gncom GENERATOR_COMMIT).
 *
 * Алгоритм на каждый кооператив:
 *
 *   1. Чтение legacy-счетов (laccounts_index, scope=coopname):
 *        cash_legacy  = account[51].available + .blocked
 *        share_legacy = account[80].available + .blocked
 *        entry_legacy = account[861].available + .blocked
 *
 *   2. Чтение параметров кооператива (cooperative2, scope=_registrator):
 *        coop.minimum     — минимальный паевой для individual / entrepreneur
 *        coop.org_minimum — минимальный паевой для organization (binary_extension)
 *
 *   3. Вычисление распределения:
 *        share_money    = cash_legacy − entry_legacy
 *        rid_share      = share_legacy − share_money
 *        min_total      = clamp(Σ accepted-пайщиков по типу, 0, share_money)
 *                         где для organization берётся coop.org_minimum,
 *                         иначе — coop.minimum (см. compute_min_total_by_type).
 *        share_remain   = share_money − min_total
 *
 *      Инварианты (eosio::check):
 *        cash_legacy  >= entry_legacy
 *        share_legacy >= share_money
 *
 *   4. Отправка 4 inline apply (ненулевые пропускаются):
 *        apply(migration::MIN_SHARE, min_total)    → Dr 51 / Cr 80, MIN_SHARE_FUND   (w.reg.minshr)
 *        apply(migration::SHARE,     share_remain) → Dr 51 / Cr 80, SHARE_FUND_PAY   (w.wal.share)
 *        apply(migration::ENTRY,     entry_legacy) → Dr 51 / Cr 86, ENTRANCE_FEES    (w.reg.entry)
 *        apply(migration::RID,       rid_share)    → Dr 04 / Cr 80, SHARE_FUND_RID   (w.wal.sharid)
 *
 *   5. Прямой emplace в wallets2 для progwallets (БЕЗ бух-проводок):
 *        Σ progwallet[blagorost].blocked → wallets2[BLAGOROST_INVEST  w.cap.bginv]
 *        Σ progwallet[generator].blocked → wallets2[GENERATOR_COMMIT  w.cap.gncom]
 *
 *      Если запись wallets2 уже есть (после inline apply сработали) —
 *      aggregate через wallets.modify(available += sum). Иначе — emplace.
 *
 * Курсорный режим: `migrate(from_coop_index, limit)`. Полный прогон —
 * `migrate(0, UINT64_MAX)`. Мета фиксирует `last_migrated_coop_index`.
 *
 * Поле `writeoff` legacy-ledger игнорируется целиком (PRD §4.1.2 FR-L-7).
 *
 * @ingroup public_ledger2_actions
 */

namespace {

struct LegacyBalances {
  eosio::asset cash;    ///< 51  — Расчётный счёт
  eosio::asset share;   ///< 80  — Паевой фонд
  eosio::asset entry;   ///< 861 — Вступительные взносы
};

inline LegacyBalances read_legacy_balances(eosio::name coopname) {
  laccounts_index old_accounts(_ledger, coopname.value);

  LegacyBalances r{
    eosio::asset(0, _root_govern_symbol),
    eosio::asset(0, _root_govern_symbol),
    eosio::asset(0, _root_govern_symbol),
  };

  for (auto acc_it = old_accounts.begin(); acc_it != old_accounts.end(); ++acc_it) {
    // writeoff игнорируется (FR-L-7).
    const eosio::asset total = acc_it->available + acc_it->blocked;
    if (total.amount == 0) continue;

    eosio::check(total.symbol == _root_govern_symbol,
                 std::string{"migrate: legacy acc "} + std::to_string(acc_it->id) +
                   " имеет неожиданный symbol");

    switch (acc_it->id) {
      case Ledger::accounts::BANK_ACCOUNT:   r.cash  = total; break;   // 51
      case Ledger::accounts::SHARE_FUND:     r.share = total; break;   // 80
      case Ledger::accounts::ENTRANCE_FEES:  r.entry = total; break;   // 861
      default:
        // Все прочие legacy-id в проде нулевые. Ненулевое — сигнал.
        eosio::check(false,
                     std::string{"migrate: неожиданный ненулевой legacy acc id="} +
                       std::to_string(acc_it->id));
    }
  }
  return r;
}

/**
 * Суммирует `available` по `progwallets` (soviet, scope=coopname) для program_id.
 * Используется voskhod-веткой миграции: переносим Цифровой Кошелёк по факту,
 * а не считаем его арифметически из (legacy_51 − legacy_861).
 */
inline eosio::asset sum_progwallet_available(eosio::name coopname, uint64_t program_id) {
  progwallets_index progwallets(_soviet, coopname.value);
  auto byprog = progwallets.get_index<"byprogram"_n>();

  eosio::asset total(0, _root_govern_symbol);

  for (auto it = byprog.lower_bound(program_id); it != byprog.end() && it->program_id == program_id; ++it) {
    if (it->available.amount == 0) continue;
    eosio::check(it->available.symbol == _root_govern_symbol,
                 std::string{"migrate: progwallet program_id="} + std::to_string(program_id) +
                   " имеет неожиданный symbol (available)");
    total += it->available;
  }
  return total;
}

/**
 * Суммирует `blocked` по `progwallets` (soviet, scope=coopname) для program_id.
 */
inline eosio::asset sum_progwallet_blocked(eosio::name coopname, uint64_t program_id) {
  progwallets_index progwallets(_soviet, coopname.value);
  auto byprog = progwallets.get_index<"byprogram"_n>();

  eosio::asset total(0, _root_govern_symbol);

  for (auto it = byprog.lower_bound(program_id); it != byprog.end() && it->program_id == program_id; ++it) {
    if (!it->blocked.has_value()) continue;
    const auto& b = it->blocked.value();
    if (b.amount == 0) continue;
    eosio::check(b.symbol == _root_govern_symbol,
                 std::string{"migrate: progwallet program_id="} + std::to_string(program_id) +
                   " имеет неожиданный symbol");
    total += b;
  }
  return total;
}

/**
 * Считает суммарный «минимальный паевой» по всем accepted-пайщикам коопа
 * с учётом типа: organization → coop.org_minimum, иначе → coop.minimum.
 *
 * Кэш `cooperative2.active_participants_count` не используется — он не несёт
 * разбивку по типу. Идём по `participants_index` напрямую.
 *
 * Если у пайщика поле `type` не заполнено (legacy-записи), считаем как
 * individual (берём `coop.minimum`). Если у коопа отсутствует `org_minimum`
 * (binary_extension не выставлен) — fallback тоже на `coop.minimum`,
 * чтобы не уронить миграцию на старых конфигах.
 */
inline eosio::asset compute_min_total_by_type(eosio::name coopname, const cooperative2& coop) {
  eosio::check(coop.minimum.symbol == _root_govern_symbol,
               std::string{"migrate: cooperative2.minimum имеет неожиданный symbol на "} +
                 coopname.to_string());

  const eosio::asset org_min =
    coop.org_minimum.has_value() ? coop.org_minimum.value() : coop.minimum;
  eosio::check(org_min.symbol == _root_govern_symbol,
               std::string{"migrate: cooperative2.org_minimum имеет неожиданный symbol на "} +
                 coopname.to_string());

  participants_index parts(_soviet, coopname.value);
  int64_t total_raw = 0;
  for (auto it = parts.begin(); it != parts.end(); ++it) {
    if (it->status != "accepted"_n) continue;
    const bool is_org =
      it->type.has_value() && it->type.value() == "organization"_n;
    total_raw += is_org ? org_min.amount : coop.minimum.amount;
  }
  return eosio::asset(total_raw, _root_govern_symbol);
}

/**
 * Отправляет inline apply для одной миграционной операции, если amount > 0.
 * process_hash детерминирован по (coopname, operation_code).
 */
inline void send_transit(eosio::name self_name,
                         eosio::name coopname,
                         eosio::name operation_code,
                         const eosio::asset& amt) {
  if (amt.amount == 0) return;

  const std::string hash_src =
    std::string{"mig::"} + coopname.to_string() + std::string{"::"} + operation_code.to_string();
  const eosio::checksum256 proc_hash = hashit(hash_src);

  Ledger2::apply(
    self_name,
    coopname,
    operation_code,
    amt,
    eosio::name{}, // username не применим к транзитной проводке
    proc_hash,
    std::string{"Транзитная миграция остатков legacy → ledger2"}
  );
}

/**
 * Прямой emplace/add в wallets2 БЕЗ бух-проводок. Используется для переноса
 * соwiet::progwallets → wallets2, т.к. progwallets не проводятся через
 * ledger::accounts (параллельная система учёта — двойная запись не нужна
 * и привела бы к двойному учёту на 80).
 */
inline void emplace_wallet_only(eosio::name self_name,
                                eosio::name coopname,
                                eosio::name wallet_id,
                                const eosio::asset& amt) {
  if (amt.amount == 0) return;

  wallets2_index wallets(self_name, coopname.value);
  const auto human_view = ledger2_get_wallet_human_name(wallet_id);
  eosio::check(!human_view.empty(),
               std::string{"migrate: unknown wallet "} + wallet_id.to_string());

  auto it = wallets.find(wallet_id.value);
  if (it == wallets.end()) {
    wallets.emplace(self_name, [&](auto& w) {
      w.id        = wallet_id;
      w.name      = std::string(human_view);
      w.available = amt;
      w.blocked   = eosio::asset(0, amt.symbol);
    });
  } else {
    // Если кошелёк уже создан (например, предыдущим inline apply TRANSIT_*) —
    // просто доливаем сумму в available. Не должно случаться при чистой
    // миграции (w.cap.bginv/w.cap.gncom не используются базовыми TRANSIT_*),
    // но безопасно.
    wallets.modify(it, self_name, [&](auto& w) { w.available += amt; });
  }
}

/**
 * Спец-ветка миграции для voskhod: переносим по фактическим суммам
 * progwallets + расчётным мин. паевым по типам, БЕЗ арифметического
 * расщепления legacy_80 на (share_money / rid_share).
 *
 * Причина: на voskhod два параллельных учёта (ledger::accounts и
 * soviet::progwallets) не сходятся между собой (расхождение порядка 70k +
 * 141k денег Благороста, прошедших через 51, и т.п.). Вместо «сшивки»
 * через арифметику — переносим именно то, что сейчас лежит на кошельках.
 *
 * Раскладка:
 *   1. w.reg.minshr  ← Σ accepted-пайщиков по типу        (Dr 51 / Cr 80)
 *   2. w.wal.share   ← Σ progwallets[pid=1].available     (Dr 51 / Cr 80)
 *   3. w.reg.entry   ← legacy_861 (фактический остаток)   (Dr 51 / Cr 86)
 *   4. w.cap.bginv   ← Σ progwallets[pid=4].blocked       (БЕЗ проводок)
 *   5. w.cap.gncom   ← Σ progwallets[pid=3].blocked       (БЕЗ проводок)
 *
 * Имущественная часть на legacy 80 (РИД) НЕ мигрируется отдельным TRANSIT_RID:
 * она остаётся в legacy::ledger как «осадок» на 80 до Phase 2 (ADR-009),
 * когда Благорост схлопнется в w.cap.blago и заберёт всё имущество туда.
 */
inline void migrate_voskhod_facts(eosio::name self_name, const cooperative2& coop) {
  const eosio::name coopname = coop.username;
  const LegacyBalances b = read_legacy_balances(coopname);

  // 1. Минимальные паевые — расчётно по типам
  const eosio::asset min_total = compute_min_total_by_type(coopname, coop);

  // 2. Цифровой Кошелёк — Σ pid=1 available из progwallets
  const eosio::asset ck_share_pay = sum_progwallet_available(coopname, 1);

  // 3. Вступительные — фактический остаток на legacy 861
  const eosio::asset entry_total = b.entry;

  // 4. Благорост, 5. Генератор — Σ blocked по соответствующим pid
  const eosio::asset blagorost_invest = sum_progwallet_blocked(coopname, 4);
  const eosio::asset generator_commit = sum_progwallet_blocked(coopname, 3);

  send_transit(self_name, coopname, operations::migration::MIN_SHARE, min_total);
  send_transit(self_name, coopname, operations::migration::SHARE,     ck_share_pay);
  send_transit(self_name, coopname, operations::migration::ENTRY,     entry_total);

  emplace_wallet_only(self_name, coopname, ledger2_wallets::BLAGOROST_INVEST,   blagorost_invest);
  emplace_wallet_only(self_name, coopname, ledger2_wallets::GENERATOR_COMMIT,   generator_commit);
}

/**
 * Мигрирует один кооператив. Отправляет до 4 inline apply (бух-проводки)
 * + прямой emplace программных кошельков (без проводок).
 *
 * Для voskhod — спец-ветка по фактам (см. migrate_voskhod_facts), т.к.
 * legacy::accounts и soviet::progwallets рассинхронизированы.
 */
inline void migrate_one_coop(eosio::name self_name, const cooperative2& coop) {
  const eosio::name coopname = coop.username;

  // voskhod — особый кейс: переносим по фактическим суммам, не арифметически
  if (coopname == "voskhod"_n) {
    migrate_voskhod_facts(self_name, coop);
    return;
  }

  const LegacyBalances b = read_legacy_balances(coopname);

  // Программные кошельки читаем всегда (Благорост + Генератор).
  const eosio::asset blagorost_invest = sum_progwallet_blocked(coopname, 4);  // ЦПП «Благорост»
  const eosio::asset generator_commit = sum_progwallet_blocked(coopname, 3);  // ЦПП «Генератор»

  // Ранний выход: нечего мигрировать (ни legacy, ни программных кошельков).
  if (b.cash.amount == 0 && b.share.amount == 0 && b.entry.amount == 0 &&
      blagorost_invest.amount == 0 && generator_commit.amount == 0) {
    return;
  }

  // ----- A. Бухгалтерский перенос legacy::accounts через 4 TRANSIT_* -----
  if (b.cash.amount > 0 || b.share.amount > 0 || b.entry.amount > 0) {
    // Деньги на паевой фонд: всё на 51 сверх вступительных.
    const eosio::asset share_money(
      b.cash.amount >= b.entry.amount ? b.cash.amount - b.entry.amount : 0,
      _root_govern_symbol
    );
    // Не-денежная часть 80: РИД Восхода (+56M) + всё, что было проведено
    // как имущество через legacy::ledger::add на 80 без prior 51.
    const eosio::asset rid_share(
      b.share.amount >= share_money.amount ? b.share.amount - share_money.amount : 0,
      _root_govern_symbol
    );

    eosio::check(b.cash.amount >= b.entry.amount,
                 std::string{"migrate: entry > cash на кооп "} + coopname.to_string());
    eosio::check(b.share.amount >= share_money.amount,
                 std::string{"migrate: share_money > share_legacy на кооп "} + coopname.to_string());

    // Минимальный паевой: Σ по accepted-пайщикам с учётом типа
    // (organization → coop.org_minimum, иначе → coop.minimum), не больше share_money.
    const eosio::asset min_total_by_type = compute_min_total_by_type(coopname, coop);
    int64_t min_total_raw = min_total_by_type.amount;
    if (min_total_raw > share_money.amount) min_total_raw = share_money.amount;
    const eosio::asset min_total(min_total_raw, _root_govern_symbol);

    const eosio::asset share_remain(
      share_money.amount - min_total.amount,
      _root_govern_symbol
    );

    send_transit(self_name, coopname, operations::migration::MIN_SHARE, min_total);
    send_transit(self_name, coopname, operations::migration::SHARE,     share_remain);
    send_transit(self_name, coopname, operations::migration::ENTRY,     b.entry);
    send_transit(self_name, coopname, operations::migration::RID,       rid_share);
  }

  // ----- B. Программные кошельки — прямой emplace, без Dr/Cr -----
  // progwallets.blocked НЕ входит в legacy::accounts[80], поэтому
  // проводить их через apply(operations::migration::*) вызвало бы двойной учёт.
  emplace_wallet_only(self_name, coopname, ledger2_wallets::BLAGOROST_INVEST,   blagorost_invest);
  emplace_wallet_only(self_name, coopname, ledger2_wallets::GENERATOR_COMMIT,   generator_commit);
}

} // namespace

void ledger2::migrate(uint64_t from_coop_index, uint64_t limit) {
  require_auth(get_self());

  ledger2_meta_index meta_tbl(get_self(), get_self().value);
  auto meta_it = meta_tbl.find(0);

  // Полный прогон уже завершён — тихий no-op (Decision #D4 / Story 1.15 AC5).
  if (meta_it != meta_tbl.end() && meta_it->migrated) {
    return;
  }

  if (meta_it != meta_tbl.end()) {
    eosio::check(from_coop_index == meta_it->last_migrated_coop_index,
                 std::string{"migrate: from_coop_index должен продолжать с last_migrated_coop_index="} +
                   std::to_string(meta_it->last_migrated_coop_index));
  } else {
    eosio::check(from_coop_index == 0,
                 "migrate: первый вызов должен начинаться с from_coop_index=0");
  }

  eosio::check(limit > 0, "migrate: limit должен быть больше 0");

  cooperatives2_index coops(_registrator, _registrator.value);

  uint64_t idx  = 0;
  uint64_t done = 0;
  bool reached_end = true;

  for (auto it = coops.begin(); it != coops.end(); ++it, ++idx) {
    if (idx < from_coop_index) continue;
    if (done >= limit) { reached_end = false; break; }

    // Мигрируем только кооперативы (не отделения и не физ. записи).
    if (it->is_cooperative) {
      migrate_one_coop(get_self(), *it);
    }
    ++done;
  }

  if (done == 0 && from_coop_index == 0 && coops.begin() == coops.end()) {
    eosio::check(false, "migrate: таблица cooperatives пуста — повторите после регистрации");
  }

  const uint64_t new_last_index = from_coop_index + done;
  const uint64_t coops_total    = meta_it == meta_tbl.end() ? done : meta_it->migrated_coops + done;
  const auto     now            = eosio::current_time_point();

  if (meta_it == meta_tbl.end()) {
    meta_tbl.emplace(get_self(), [&](auto& m) {
      m.id                       = 0;
      m.migrated                 = reached_end;
      m.migrated_coops           = coops_total;
      m.last_migrated_coop_index = new_last_index;
      m.migrated_at              = now;
    });
  } else {
    meta_tbl.modify(meta_it, get_self(), [&](auto& m) {
      m.migrated                 = reached_end;
      m.migrated_coops           = coops_total;
      m.last_migrated_coop_index = new_last_index;
      m.migrated_at              = now;
    });
  }
}
