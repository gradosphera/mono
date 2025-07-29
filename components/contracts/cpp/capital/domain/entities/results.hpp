#pragma once

using namespace eosio;
using std::string;

namespace Capital {


struct [[eosio::table, eosio::contract(CAPITAL)]] result {
  uint64_t id;
  checksum256 project_hash;
  checksum256 assignment_hash;
  checksum256 result_hash;
  
  eosio::name coopname;
  eosio::name username;

  eosio::name type; ///< intellectual | property
  eosio::name status = "created"_n; ///< created | statement | decision | act1 | act2 | completed
  time_point_sec created_at = current_time_point();

  eosio::asset creator_base_amount = asset(0, _root_govern_symbol);
  eosio::asset debt_amount = asset(0, _root_govern_symbol);
  
  eosio::asset creator_bonus_amount = asset(0, _root_govern_symbol);
  eosio::asset author_bonus_amount = asset(0, _root_govern_symbol);
  eosio::asset generation_amount = asset(0, _root_govern_symbol);
  eosio::asset capitalist_bonus_amount = asset(0, _root_govern_symbol);
  
  eosio::asset total_amount = asset(0, _root_govern_symbol);
  eosio::asset available_for_return = asset(0, _root_govern_symbol);
  eosio::asset available_for_convert = asset(0, _root_govern_symbol);
      
  document2 result_statement; ///< Заявление
  document2 approved_statement; ///< Принятое заявление
  document2 authorization; ///< Решение совета
  document2 act1; ///< Акт1
  document2 act2; ///< Акт2
  
  uint64_t primary_key() const { return id; }     ///< Основной ключ.
  uint64_t by_username() const { return username.value; } ///< Индекс по владельцу
  checksum256 by_hash() const { return result_hash; } ///< Индекс по хэшу проекта
  
  checksum256 by_assignment_hash() const { return assignment_hash; } ///< Индекс по хэшу
  checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта
  
  uint128_t by_assignment_user() const {
      return combine_checksum_ids(assignment_hash, username);
  }
};

typedef eosio::multi_index<"results"_n, result,
  indexed_by<"byusername"_n, const_mem_fun<result, uint64_t, &result::by_username>>,
  indexed_by<"byhash"_n, const_mem_fun<result, checksum256, &result::by_hash>>,
  indexed_by<"byassignment"_n, const_mem_fun<result, checksum256, &result::by_assignment_hash>>,
  indexed_by<"byprojecthash"_n, const_mem_fun<result, checksum256, &result::by_project_hash>>,
  indexed_by<"byresuser"_n, const_mem_fun<result, uint128_t, &result::by_assignment_user>>
> result_index;



inline std::optional<result> get_result(eosio::name coopname, const checksum256 &result_hash) {
  result_index results(_capital, coopname.value);
  auto idx = results.get_index<"byhash"_n>();
  
  auto it = idx.find(result_hash);
  if (it == idx.end()) {
      return std::nullopt;
  }
  return *it;
}

inline std::optional<result> get_result_by_assignment_and_username(eosio::name coopname, const checksum256 &assignment_hash, eosio::name username) {
  result_index results(_capital, coopname.value);
  auto idx = results.get_index<"byresuser"_n>();
  auto rkey = combine_checksum_ids(assignment_hash, username);

  auto it = idx.find(rkey);
  if (it == idx.end()) {
      return std::nullopt;
  }
  return *it;
}

inline result get_result_by_assignment_and_username_or_fail(eosio::name coopname, const checksum256 &assignment_hash, eosio::name username, const char* msg) {
  auto c = get_result_by_assignment_and_username(coopname, assignment_hash, username);
  eosio::check(c.has_value(), msg);
  return *c;
}

}// namespace Capital