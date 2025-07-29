#pragma once

using namespace eosio;
using std::string;

namespace Capital {

struct [[eosio::table, eosio::contract(CAPITAL)]] assignment {
  uint64_t id;
  checksum256 assignment_hash;
  checksum256 project_hash;
  eosio::name status = "opened"_n; ///< opened | closed

  eosio::name coopname;
  eosio::name assignee;
  std::string description;

  uint64_t authors_shares;
  uint64_t total_creators_bonus_shares;

  uint64_t authors_count;
  uint64_t commits_count;
  time_point_sec created_at = current_time_point();
  time_point_sec expired_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + 365 * 86400);
  
  eosio::asset allocated = asset(0, _root_govern_symbol); ///< аллоцированные на создание задания средства
  eosio::asset available = asset(0, _root_govern_symbol); ///< зарезерированные на создание задания средства
  eosio::asset spended = asset(0, _root_govern_symbol); ///< фактически потраченные ресурсы на создание задание в виде времени (паевые взносы-возвраты)
  eosio::asset generated = asset(0, _root_govern_symbol); ///< стоимость РИД с учётом премий авторов и создателей
  eosio::asset expensed = asset(0, _root_govern_symbol); ///< фактически потраченные на создание задания средства в виде расходов (подписки, прочее)
  eosio::asset withdrawed = asset(0, _root_govern_symbol); ///< фактически возвращенные средства из задания
  
  eosio::asset creators_base = asset(0, _root_govern_symbol); ///< себестоимость РИД
  
  eosio::asset creators_bonus = asset(0, _root_govern_symbol); ///< премии создателей - 0.382 от себестоимости (creators_base)
  eosio::asset authors_bonus = asset(0, _root_govern_symbol);  ///< премии авторов - 1.618 от себестоимости (creators_base)
  eosio::asset capitalists_bonus = asset(0, _root_govern_symbol); ///< премии пайщиков кооператива - 1.618 от generated_amount
  
  eosio::asset total = asset(0, _root_govern_symbol); ///< Стоимость РИД с учетом генерации и капитализации (стоимость РИД в spended + authors_bonus + creators_bonus + capitalists_bonus)
  
  eosio::asset authors_bonus_remain = asset(0, _root_govern_symbol); ///< сумма остатка для выплаты авторам
  eosio::asset creators_base_remain = asset(0, _root_govern_symbol); ///< сумма остатка для выплаты авторам
  
  eosio::asset creators_bonus_remain = asset(0, _root_govern_symbol); ///< сумма остатка для выплаты авторам
      
  eosio::asset capitalists_bonus_remain = asset(0, _root_govern_symbol); ///< сумма остатка для выплаты пайщикам
  
  uint64_t primary_key() const { return id; }     ///< Основной ключ.
  checksum256 by_hash() const { return assignment_hash; } ///< Индекс по хэшу задания.
  checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу идеи    
};

typedef eosio::multi_index<"assignments"_n, assignment,
  indexed_by<"byhash"_n, const_mem_fun<assignment, checksum256, &assignment::by_hash>>,
  indexed_by<"byprojecthash"_n, const_mem_fun<assignment, checksum256, &assignment::by_project_hash>>
> assignment_index;

inline std::optional<assignment> get_assignment(eosio::name coopname, const checksum256 &assignment_hash) {
  assignment_index assignments(_capital, coopname.value);
  auto assignment_hash_index = assignments.get_index<"byhash"_n>();

  auto assignment_itr = assignment_hash_index.find(assignment_hash);
  if (assignment_itr == assignment_hash_index.end()) {
      return std::nullopt;
  }

  return *assignment_itr;
}

inline assignment get_assignment_or_fail(eosio::name coopname, const checksum256 &assignment_hash, const char* msg) {
  auto maybe_assignment = get_assignment(coopname, assignment_hash);
  eosio::check(maybe_assignment.has_value(), msg);
  return *maybe_assignment;
}

}// namespace Capital