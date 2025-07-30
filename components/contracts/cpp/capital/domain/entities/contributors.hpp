#pragma once

using namespace eosio;
using std::string;

namespace Capital {

/**
  * @brief Структура участника, хранящая данные индивидуального участника.
  */
  struct [[eosio::table, eosio::contract(CAPITAL)]] contributor {
    uint64_t id;
    name coopname;
    name username;
    checksum256 contributor_hash; ///< Внешний идентификатор контрибьютора
    name status;
    time_point_sec created_at;
    bool is_external_contract = false;
    document2 contract;
    // document2 authorization;
    
    eosio::asset invested = asset(0, _root_govern_symbol);
    
    uint64_t convert_percent;
    uint64_t contributed_hours;
    
    eosio::asset rate_per_hour = asset(0, _root_govern_symbol);
    
    eosio::asset spended = asset(0, _root_govern_symbol);
    eosio::asset debt_amount = asset(0, _root_govern_symbol);
    
    eosio::asset withdrawed = asset(0, _root_govern_symbol);
    eosio::asset converted = asset(0, _root_govern_symbol);
    eosio::asset expensed = asset(0, _root_govern_symbol);
    eosio::asset returned = asset(0, _root_govern_symbol);
    
    eosio::asset share_balance = asset(0, _root_govern_symbol); ///< Баланс долей пайщика
    eosio::asset pending_rewards = asset(0, _root_govern_symbol); ///< Накопленные награды
    int64_t reward_per_share_last = 0; ///< Последний зафиксированный cumulative_reward_per_share по проекту
    
    std::vector<checksum256> appendixes; ///< Вектор хэшей проектов, для которых подписаны приложения

    uint64_t primary_key() const { return id; }
    uint64_t by_username() const { return username.value; }
    checksum256 by_hash() const { return contributor_hash; }
};

typedef eosio::multi_index<
    "contributors"_n, contributor,
    indexed_by<"byusername"_n, const_mem_fun<contributor, uint64_t, &contributor::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<contributor, checksum256, &contributor::by_hash>>
> contributor_index;


/**
 * @brief Получает участника по имени аккаунта.
 */
 inline std::optional<contributor> get_contributor(eosio::name coopname, eosio::name username) {
  contributor_index contributors(_capital, coopname.value);
  auto username_index = contributors.get_index<"byusername"_n>();

  auto itr = username_index.find(username.value);
  if (itr == username_index.end()) {
      return std::nullopt;
  }

  return *itr;
}


/**
 * @brief Получает участника по хэшу контрибьютора.
 */
 inline std::optional<contributor> get_contributor_by_hash(eosio::name coopname, const checksum256& contributor_hash) {
  contributor_index contributors(_capital, coopname.value);
  auto hash_index = contributors.get_index<"byhash"_n>();

  auto itr = hash_index.find(contributor_hash);
  if (itr == hash_index.end()) {
      return std::nullopt;
  }

  return *itr;
}


/**
* @brief Проверяет есть ли у контрибьютора приложение для проекта
*/
inline bool is_contributor_has_appendix_in_project(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
  auto contributor = get_contributor(coopname, username);
  if (!contributor.has_value()) {
      return false;
  }
  
  // Проверяем есть ли project_hash в векторе appendixes
  for (const auto& appendix_project_hash : contributor->appendixes) {
      if (appendix_project_hash == project_hash) {
          return true;
      }
  }
  
  return false;
}


/**
* @brief Получает участника по имени аккаунта и проверяет на активность.
*/
inline std::optional<contributor> get_active_contributor_or_fail(eosio::name coopname, eosio::name username) {
  auto contributor = get_contributor(coopname, username);
  eosio::check(contributor.has_value(), "Создатель не подписывал договор УХД");
  eosio::check(contributor -> status == "authorized"_n, "Договор УХД с пайщиком не активен");
  return contributor;
}


/**
* @brief Получает участника по имени аккаунта, проверяет активность и членство в проекте.
*/
inline std::optional<contributor> get_active_contributor_with_appendix_or_fail(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
  auto contributor = get_active_contributor_or_fail(coopname, username);
  eosio::check(is_contributor_has_appendix_in_project(coopname, project_hash, username), 
               "Пайщик не подписывал приложение к договору УХД для данного проекта");
  return contributor;
}

}// namespace Capital