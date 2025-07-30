#pragma once

using namespace eosio;
using std::string;

namespace Capital {

/**
* @brief Таблица проектов
* 
*/
struct [[eosio::table, eosio::contract(CAPITAL)]] project {
  uint64_t id;
  
  name coopname;
  checksum256 project_hash;
  checksum256 parent_project_hash;
  eosio::name status = "created"_n; ///< created
  
  std::string title;
  std::string description;
  std::string meta;
  
  uint64_t authors_count;
  uint64_t authors_shares;
  uint64_t commits_count;

  std::vector<uint64_t> expense_funds = {4}; 
  
  eosio::asset target = asset(0, _root_govern_symbol);
  eosio::asset invested = asset(0, _root_govern_symbol);
  eosio::asset available = asset(0, _root_govern_symbol);
  eosio::asset allocated = asset(0, _root_govern_symbol);
  
  eosio::asset creators_base = asset(0, _root_govern_symbol);
  eosio::asset creators_bonus = asset(0, _root_govern_symbol);
  eosio::asset authors_bonus = asset(0, _root_govern_symbol);
  eosio::asset capitalists_bonus = asset(0, _root_govern_symbol);
  eosio::asset total = asset(0, _root_govern_symbol); // стоимость проекта с учетом генерации и капитализации
  
  eosio::asset expensed = asset(0, _root_govern_symbol);
  eosio::asset spended = asset(0, _root_govern_symbol);
  eosio::asset generated = asset(0, _root_govern_symbol);
  eosio::asset converted = asset(0, _root_govern_symbol);
  eosio::asset withdrawed = asset(0, _root_govern_symbol);
  
  double parent_distribution_ratio = 1;  
  int64_t membership_cumulative_reward_per_share = 0; 
  
  eosio::asset total_share_balance = asset(0, _root_govern_symbol); ///< Общее количество долей пайщиков в проекте
  eosio::asset membership_funded = asset(0, _root_govern_symbol);       ///< Общее количество поступивших членских взносов 
  eosio::asset membership_available = asset(0, _root_govern_symbol);    ///< Доступное количество членских взносов для участников проекта согласно долям
  eosio::asset membership_distributed = asset(0, _root_govern_symbol); ///< Распределенное количество членских взносов на участников проекта
      
  time_point_sec created_at = current_time_point();
  
  uint64_t primary_key() const { return id; }
  uint64_t by_created_at() const { return created_at.sec_since_epoch(); }
  checksum256 by_hash() const { return project_hash; }
};

typedef eosio::multi_index<"projects"_n, project,
  indexed_by<"bycreatedat"_n, const_mem_fun<project, uint64_t, &project::by_created_at>>,
  indexed_by<"byhash"_n, const_mem_fun<project, checksum256, &project::by_hash>>
> project_index;


inline std::optional<project> get_project(eosio::name coopname, const checksum256 &project_hash) {
  project_index projects(_capital, coopname.value);
  auto project_hash_index = projects.get_index<"byhash"_n>();

  auto project_itr = project_hash_index.find(project_hash);
  if (project_itr == project_hash_index.end()) {
      return std::nullopt;
  }

  return *project_itr;
}


inline void validate_project_hierarchy_depth(eosio::name coopname, checksum256 project_hash) {
  uint8_t level = 0;
  project_index projects(_capital, coopname.value);
  
  auto current_project = get_project(coopname, project_hash);
  eosio::check(current_project.has_value(), "Проект не найден");

  while (current_project -> parent_project_hash != checksum256()) {
      eosio::check(level < 12, "Превышено максимальное количество уровней родительских проектов (12)");

      current_project = get_project(coopname, current_project->parent_project_hash);
      eosio::check(current_project.has_value(), "Родительский проект не найден");

      level++;
  };
};

}// namespace Capital