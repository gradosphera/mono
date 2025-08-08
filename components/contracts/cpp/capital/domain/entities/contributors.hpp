#pragma once

using namespace eosio;
using std::string;

namespace Capital {

/**
  * @brief Структура участника, хранящая данные индивидуального участника.
  */
  struct [[eosio::table, eosio::contract(CAPITAL)]] contributor {
    uint64_t id; ///< Идентификатор контрибьютора
    name coopname; ///< Имя кооператива
    name username; ///< Имя пользователя
    checksum256 contributor_hash; ///< Внешний идентификатор контрибьютора
    time_point_sec created_at; ///< Время создания контрибьютора
    name status; ///< Статус контрибьютора
    
    bool is_external_contract = false; ///< Флаг, указывающий на внешний контракт
    document2 contract; ///< Договор УХД
    std::vector<checksum256> appendixes; ///< Вектор хэшей проектов, для которых подписаны приложения
    
    eosio::asset rate_per_hour = asset(0, _root_govern_symbol); ///< Ставка за час
    
    eosio::asset debt_amount = asset(0, _root_govern_symbol);///< Сумма долга
    
    eosio::asset capital_available = asset(0, _root_govern_symbol); ///< Накопленные членские взносы по программе капитализации
    int64_t reward_per_share_last = 0; ///< Последний зафиксированный cumulative_reward_per_share по программе капитализации

    uint64_t primary_key() const { return id; }
    uint64_t by_username() const { return username.value; }
    checksum256 by_hash() const { return contributor_hash; }
    
};

typedef eosio::multi_index<
    "contributors"_n, contributor,
    indexed_by<"byusername"_n, const_mem_fun<contributor, uint64_t, &contributor::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<contributor, checksum256, &contributor::by_hash>>
> contributor_index;
}// namespace Capital

namespace Capital::Contributors {

  /**
   * @brief Константы статусов контрибьюторов
   */
  namespace Status {
    const eosio::name PENDING = "pending"_n;       ///< Ожидает подтверждения
    const eosio::name ACTIVE = "active"_n; ///< Авторизован/активен
  }

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
  eosio::check(contributor -> status == Status::ACTIVE, "Договор УХД с пайщиком не активен");
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

}// namespace Capital::Contributors