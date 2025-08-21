#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <optional>

using namespace eosio;
using std::string;

/**
 * @brief Сигнатуры действий контракта loan.
 * @ingroup public_consts
 * @ingroup public_loan_consts
 * @anchor loan_action_signatures
 */
// Сигнатуры как макросы
#define CREATEDEBT_SIGNATURE name coopname, name username, checksum256 debt_hash, time_point_sec repaid_at, asset quantity
#define SETTLEDEBT_SIGNATURE name coopname, name username, checksum256 debt_hash, asset quantity

// Типы для compile-time проверки
using createdebt_interface = void(CREATEDEBT_SIGNATURE);
using settledebt_interface = void(SETTLEDEBT_SIGNATURE);


namespace Loan {
  using namespace eosio;

  /**
   * @brief Структура долгового обязательства.
   * @ingroup public_tables
   * @ingroup public_loan_tables
   * @anchor loan_debt
   * @par Область памяти (scope): coopname
   * @par Имя таблицы (table): debts
   */
  struct [[eosio::table, eosio::contract(LOAN)]] debt {
    uint64_t    id;                ///< Идентификатор долга
    name        coopname;          ///< Имя кооператива
    name        username;          ///< Имя пользователя-должника
    checksum256 debt_hash;         ///< Хэш долгового обязательства
    asset       amount;            ///< Сумма долга
    time_point_sec  created_at;    ///< Время создания долга
    time_point_sec  repaid_at;     ///< Срок погашения долга

    uint64_t primary_key() const { return id; }
    uint64_t by_username() const { return username.value; }
    checksum256 by_debt_hash() const { return debt_hash; }
    uint64_t by_created() const { return created_at.sec_since_epoch(); }
    uint64_t by_repaid() const { return repaid_at.sec_since_epoch(); }
  };

  typedef multi_index<
    "debts"_n,
    debt,
    indexed_by<"byusername"_n, const_mem_fun<debt, uint64_t, &debt::by_username>>,
    indexed_by<"bydebthash"_n, const_mem_fun<debt, checksum256, &debt::by_debt_hash>>,
    indexed_by<"bycreated"_n, const_mem_fun<debt, uint64_t, &debt::by_created>>,
    indexed_by<"byrepaid"_n, const_mem_fun<debt, uint64_t, &debt::by_repaid>>
  > debts_index;

  /**
   * @brief Структура сводки по долгам пользователя.
   * @ingroup public_tables
   * @ingroup public_loan_tables
   * @anchor loan_summary
   * @par Область памяти (scope): coopname
   * @par Имя таблицы (table): summaries
   */
  struct [[eosio::table, eosio::contract(LOAN)]] summary {
    name  username;    ///< Имя пользователя
    asset total;       ///< Общая сумма долгов пользователя

    uint64_t primary_key() const { return username.value; }
  };

  typedef multi_index<"summaries"_n, summary> summaries_index;

  /**
   * @brief Получает долговое обязательство по хэшу.
   * @param coopname Имя кооператива
   * @param debt_hash Хэш долгового обязательства
   * @return Опциональное значение долга или nullopt если не найден
   */
  inline std::optional<debt> get_debt(name coopname, const checksum256& debt_hash) {
    debts_index debts(_loan, coopname.value);
    auto by_hash = debts.get_index<"bydebthash"_n>();
    auto it = by_hash.find(debt_hash);
    if (it == by_hash.end()) return std::nullopt;
    return *it;
  }

  /**
   * @brief Получает сводку по долгам пользователя.
   * @param coopname Имя кооператива
   * @param username Имя пользователя
   * @return Опциональное значение сводки или nullopt если не найдена
   */
  inline std::optional<summary> get_summary(name coopname, name username) {
    summaries_index summaries(_loan, coopname.value);
    auto it = summaries.find(username.value);
    if (it == summaries.end()) return std::nullopt;
    return *it;
  }
  
  /**
   * @brief Проверяет отсутствие просроченных долгов у пользователя.
   * @param coopname Имя кооператива
   * @param username Имя пользователя
   * @throws eosio::check_failure если у пользователя есть просроченные долги
   */
  inline void assert_no_expired_debts(name coopname, name username) {
    debts_index debts(_loan, coopname.value);
    auto by_repaid = debts.get_index<"byrepaid"_n>();

    uint32_t now = time_point_sec(current_time_point()).sec_since_epoch();

    for (auto itr = by_repaid.begin(); itr != by_repaid.end() && itr->repaid_at.sec_since_epoch() <= now; ++itr) {
      if (itr->username == username) {
        eosio::check(false, "У пользователя есть просроченные долги");
      }
    }
  }
  
  /**
   * @brief Создает долговое обязательство через интерфейс.
   * @param calling_contract Контракт, вызывающий создание долга
   * @param coopname Имя кооператива
   * @param username Имя пользователя-должника
   * @param debt_hash Хэш долгового обязательства
   * @param repaid_at Срок погашения долга
   * @param quantity Сумма долга
   */
  inline void create_debt(
    name calling_contract,
    CREATEDEBT_SIGNATURE
  ) {
    //Создаём объект долга в контракте loan
    Action::send<createdebt_interface>(
      _loan,
      Names::Loan::CREATE_DEBT,
      calling_contract,
      coopname, 
      username, 
      debt_hash, 
      repaid_at,
      quantity
    );
  }
  
  /**
   * @brief Погашает долговое обязательство через интерфейс.
   * @param calling_contract Контракт, вызывающий погашение долга
   * @param coopname Имя кооператива
   * @param username Имя пользователя-должника
   * @param debt_hash Хэш долгового обязательства
   * @param quantity Сумма погашения
   */
  inline void settle_debt(
    name calling_contract,
    SETTLEDEBT_SIGNATURE
  ) {
    Action::send<settledebt_interface>(
      _loan,
      Names::Loan::SETTLE_DEBT,
      calling_contract,
      coopname,
      username,
      debt_hash,
      quantity
    );
  }
  
}
