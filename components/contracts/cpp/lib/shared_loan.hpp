#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <optional>

using namespace eosio;
using std::string;

// Сигнатуры как макросы
#define CREATEDEBT_SIGNATURE name coopname, name username, checksum256 debt_hash, time_point_sec repaid_at, asset quantity
#define SETTLEDEBT_SIGNATURE name coopname, name username, checksum256 debt_hash, asset quantity

// Типы для compile-time проверки
using createdebt_interface = void(CREATEDEBT_SIGNATURE);
using settledebt_interface = void(SETTLEDEBT_SIGNATURE);


namespace Loan {
  using namespace eosio;

  struct [[eosio::table, eosio::contract(LOAN)]] debt {
    uint64_t    id;
    name        coopname;
    name        username;
    checksum256 debt_hash;
    asset       amount;
    time_point_sec  created_at;
    time_point_sec  repaid_at;

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

  struct [[eosio::table, eosio::contract(LOAN)]] summary {
    name  username;
    asset total;

    uint64_t primary_key() const { return username.value; }
  };

  typedef multi_index<"summaries"_n, summary> summaries_index;

  inline std::optional<debt> get_debt(name coopname, const checksum256& debt_hash) {
    debts_index debts(_loan, coopname.value);
    auto by_hash = debts.get_index<"bydebthash"_n>();
    auto it = by_hash.find(debt_hash);
    if (it == by_hash.end()) return std::nullopt;
    return *it;
  }

  inline std::optional<summary> get_summary(name coopname, name username) {
    summaries_index summaries(_loan, coopname.value);
    auto it = summaries.find(username.value);
    if (it == summaries.end()) return std::nullopt;
    return *it;
  }
  
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

}
