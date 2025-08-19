#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;
using std::string;

namespace Capital::Debts {

/**
 * @brief Статусы долгов
 */
namespace Status {
  constexpr name CREATED = "created"_n;      ///< Долг создан
  constexpr name APPROVED = "approved"_n;    ///< Долг одобрен
  constexpr name AUTHORIZED = "authorized"_n; ///< Долг авторизован советом
  constexpr name PAID = "paid"_n;            ///< Долг выплачен
}

/**
 * @brief Структура долга
 */
struct [[eosio::table, eosio::contract(CAPITAL)]] debt {
  uint64_t         id;
  eosio::name      coopname;
  eosio::name      username;
  eosio::name      status = Status::CREATED;
  checksum256      debt_hash;
  checksum256      project_hash;
  time_point_sec   repaid_at;
  asset            amount;
  document2        statement;
  document2        approved_statement;
  document2        authorization;
  std::string      memo;
  
  uint64_t primary_key() const { return id; }

  uint64_t by_username() const { return username.value; }
  checksum256 by_debt_hash() const { return debt_hash; }
  checksum256 by_project_hash() const { return project_hash; }
};

typedef eosio::multi_index<
  "debts"_n,
  debt,
  indexed_by<"byusername"_n, const_mem_fun<debt, uint64_t, &debt::by_username>>,
  indexed_by<"bydebthash"_n, const_mem_fun<debt, checksum256, &debt::by_debt_hash>>,
  indexed_by<"byprojhash"_n, const_mem_fun<debt, checksum256, &debt::by_project_hash>>
> debts_index;

/**
 * @brief Получает долг по хэшу
 */
inline std::optional<debt> get_debt(eosio::name coopname, const checksum256 &debt_hash) {
  debts_index debts(_capital, coopname.value);
  auto hash_index = debts.get_index<"bydebthash"_n>();

  auto itr = hash_index.find(debt_hash);
  if (itr == hash_index.end()) {
      return std::nullopt;
  }

  return *itr;
}

/**
 * @brief Получает долг по хэшу или падает с ошибкой
 */
inline debt get_debt_or_fail(eosio::name coopname, const checksum256 &debt_hash, const char* msg = "Долг не найден") {
  auto maybe_debt = get_debt(coopname, debt_hash);
  eosio::check(maybe_debt.has_value(), msg);
  return *maybe_debt;
}

/**
 * @brief Создает долг в таблице
 */
inline void create_debt(
  eosio::name coopname,
  eosio::name username, 
  const checksum256 &project_hash,
  const checksum256 &debt_hash,
  const asset &amount,
  const time_point_sec &repaid_at,
  const document2 &statement,
  eosio::name payer = name{}
) {
  if (payer == name{}) payer = coopname;
  
  // Проверяем что долга с таким хэшем еще нет
  auto exist_debt = get_debt(coopname, debt_hash);
  eosio::check(!exist_debt.has_value(), "Ссуда с указанным hash уже существует");
  
  debts_index debts(_capital, coopname.value);
  auto debt_id = get_global_id_in_scope(_capital, coopname, "debts"_n);
  
  debts.emplace(payer, [&](auto &d){
    d.id = debt_id;
    d.coopname = coopname;
    d.username = username;
    d.status = Status::CREATED;
    d.debt_hash = debt_hash;
    d.project_hash = project_hash;
    d.amount = amount;
    d.statement = statement;
    d.repaid_at = repaid_at;
  });
}

/**
 * @brief Обновляет статус долга
 */
inline void update_debt_status(
  eosio::name coopname,
  const checksum256 &debt_hash,
  eosio::name new_status,
  eosio::name payer = name{},
  const document2 &document = document2{},
  const std::string &memo = ""
) {
  if (payer == name{}) payer = coopname;
  
  auto exist_debt = get_debt_or_fail(coopname, debt_hash);
  
  debts_index debts(_capital, coopname.value);
  auto debt = debts.find(exist_debt.id);
  
  debts.modify(debt, payer, [&](auto &d) {
    d.status = new_status;
    
    if (new_status == Status::APPROVED) {
      d.approved_statement = document;
    } else if (new_status == Status::AUTHORIZED) {
      d.authorization = document;
    }
    
    if (!memo.empty()) {
      d.memo = memo;
    }
  });
}

/**
 * @brief Удаляет долг
 */
inline void delete_debt(eosio::name coopname, const checksum256 &debt_hash) {
  auto exist_debt = get_debt_or_fail(coopname, debt_hash);
  
  debts_index debts(_capital, coopname.value);
  auto debt = debts.find(exist_debt.id);
  
  debts.erase(debt);
}

/**
 * @brief Создает аппрув для долга
 */
inline void create_debt_approval(
  eosio::name coopname,
  eosio::name username,
  const checksum256 &debt_hash,
  const document2 &statement
) {
  ::Soviet::create_approval(
    _capital,
    coopname,
    username,
    statement,
    Names::Capital::CREATE_DEBT,
    debt_hash,
    _capital,
    "approvedebt"_n,
    "declinedebt"_n,
    std::string("")
  );
}

/**
 * @brief Создает агенду в совете для долга
 */
inline void create_debt_agenda(
  eosio::name coopname,
  eosio::name username,
  const checksum256 &debt_hash,
  const document2 &statement
) {
  ::Soviet::create_agenda(
    _capital,
    coopname,
    username, 
    Names::SovietActions::CREATE_DEBT,
    debt_hash, 
    _capital, 
    Names::Capital::AUTHORIZE_DEBT, 
    Names::Capital::DECLINE_DEBT, 
    statement, 
    std::string("")
  );
}


} // namespace Capital::Debts