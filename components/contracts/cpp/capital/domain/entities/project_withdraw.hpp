#pragma once

using namespace eosio;
using std::string;

namespace Capital::ProjectWithdraw {
  /**
   * @brief Константы статусов возвратов из проекта
   * @ingroup public_consts
   * @ingroup public_capital_consts
   * @anchor capital_project_withdraw_status
   */
   namespace Status {
    const eosio::name CREATED = "created"_n;     ///< Запрос на возврат создан
    const eosio::name APPROVED = "approved"_n;   ///< Запрос на возврат одобрен
  }
}

namespace Capital {

  /**
   * @brief Таблица возвратов из проекта хранит данные о запросах на возврат средств из проектов.
   * @ingroup public_tables
   * @ingroup public_capital_tables
   * @anchor capital_project_withdraw
   * @par Область памяти (scope): coopname
   * @par Имя таблицы (table): prjwithdraws 
   */
  struct [[eosio::table, eosio::contract(CAPITAL)]] project_withdraw {
    uint64_t id;                                ///< ID запроса на возврат (внутренний ключ)
    name coopname;                              ///< Имя кооператива
    checksum256 project_hash;                   ///< Хэш проекта
    checksum256 withdraw_hash;                  ///< Хэш запроса на возврат
    name username;                              ///< Имя участника, запрашивающего возврат
    name status;                                ///< Статус запроса (created | approved)
    asset amount = asset(0, _root_govern_symbol); ///< Запрошенная сумма для возврата
    document2 statement;                        ///< Заявление на возврат паевого взноса деньгами
  
    time_point_sec created_at = current_time_point(); ///< Время создания запроса
  
    uint64_t primary_key() const { return id; } ///< Первичный ключ (1)
    uint64_t by_username() const { return username.value; } ///< Индекс по имени пользователя (2)
    checksum256 by_hash() const { return withdraw_hash; } ///< Индекс по хэшу запроса (3)
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта (4)
  };

typedef eosio::multi_index<"prjwithdraws"_n, project_withdraw,
  indexed_by<"byhash"_n, const_mem_fun<project_withdraw, checksum256, &project_withdraw::by_hash>>,
  indexed_by<"byusername"_n, const_mem_fun<project_withdraw, uint64_t, &project_withdraw::by_username>>
> project_withdraws_index; ///< Таблица для хранения запросов на возврат из проекта.

/**
 * @brief Получает запрос на возврат из проекта по хэшу.
 * @param coopname Имя кооператива (scope таблицы).
 * @param hash Хэш запроса на возврат.
 * @return Найденный запрос на возврат или nullopt, если запрос не найден.
 */
inline std::optional<project_withdraw> get_project_withdraw(eosio::name coopname, const checksum256 &hash) {
  Capital::project_withdraws_index project_withdraws(_capital, coopname.value);
  auto index = project_withdraws.get_index<"byhash"_n>();

  auto itr = index.find(hash);
  
  if (itr == index.end()) {
      return std::nullopt;
  }

  return *itr;
}

}// namespace Capital