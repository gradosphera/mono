#pragma once

#include "pools.hpp"

using namespace eosio;
using std::string;

namespace Capital {

/**
  * @brief Структура коммитов, хранящая данные о выполненных операциях в проекте.
  * \ingroup public_tables
  */
  struct [[eosio::table, eosio::contract(CAPITAL)]] commit {
    uint64_t id;                                 ///< Уникальный идентификатор действия.
    name coopname;                               ///< Имя кооператива.
    name application;                            ///< Приложение, инициировавшее действие.
    name username;                               ///< Имя пользователя, совершившего действие.
    name status;                                 ///< Статус коммита (created | approved | authorized | act1 | act2 )
    checksum256 project_hash;                    ///< Хэш проекта, связанного с действием.
    checksum256 commit_hash;                     ///< Хэш действия.
    
    // Информация о времени и ставке
    uint64_t creator_hours;                  ///< Количество часов, затраченных на коммит
    eosio::asset rate_per_hour = asset(0, _root_govern_symbol); ///< Стоимость часа создателя
    
    // Структурированные суммы коммита
    eosio::asset creator_base;                   ///< Себестоимость создателя (основа)
    pools amounts;                               ///< Рассчитанные показатели генерации
    
    std::string decline_comment;
    time_point_sec created_at;                   ///< Дата и время создания действия.

    uint64_t primary_key() const { return id; } ///< Основной ключ.
    uint64_t by_username() const { return username.value; } ///< По имени пользователя.
    checksum256 by_commit_hash() const { return commit_hash; } ///< Индекс по хэшу задачи.
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта.
};

typedef eosio::multi_index<
    "commits"_n, commit,
    indexed_by<"byusername"_n, const_mem_fun<commit, uint64_t, &commit::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<commit, checksum256, &commit::by_commit_hash>>,
    indexed_by<"byprojhash"_n, const_mem_fun<commit, checksum256, &commit::by_project_hash>>
> commit_index;



/**
 * @brief Получает действие по хэшу действия.
 * @param coopname Имя кооператива (scope таблицы).
 * @param hash Хэш действия.
 * @return `std::optional<commit>` - найденное действие или `std::nullopt`, если его нет.
 */
 inline std::optional<commit> get_commit(eosio::name coopname, const checksum256 &hash) {
  commit_index commits(_capital, coopname.value);
  auto commit_index = commits.get_index<"byhash"_n>();

  auto itr = commit_index.find(hash);
  if (itr == commit_index.end()) {
      return std::nullopt;
  }

  return *itr;

}

/**
 * @brief Удаляет коммит по хэшу действия.
 * @param coopname Имя кооператива (scope таблицы).
 * @param hash Хэш действия.
 */
inline void delete_commit(eosio::name coopname, const checksum256 &hash) {
  commit_index commits(_capital, coopname.value);
  auto commit_index = commits.get_index<"byhash"_n>();

  auto itr = commit_index.find(hash);
  eosio::check(itr != commit_index.end(), "Коммит не найден");

  commits.erase(*itr);
}

} // namespace Capital