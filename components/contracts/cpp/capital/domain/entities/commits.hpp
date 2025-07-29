#pragma once

using namespace eosio;
using std::string;

namespace Capital {

/**
  * @brief Структура действий, хранящая данные о выполненных операциях.
  * \ingroup public_tables
  */
  struct [[eosio::table, eosio::contract(CAPITAL)]] commit {
    uint64_t id;                                 ///< Уникальный идентификатор действия.
    name coopname;                               ///< Имя кооператива.
    name application;                            ///< Приложение, инициировавшее действие.
    name username;                               ///< Имя пользователя, совершившего действие.
    name status;                                 ///< Статус коммита (created | approved | authorized | act1 | act2 )
    checksum256 project_hash;                    ///< Хэш проекта, связанного с действием.
    checksum256 assignment_hash;                     ///< Хэш задания, связанного с действием.
    checksum256 commit_hash;                     ///< Хэш действия.
    uint64_t contributed_hours;              ///< Сумма временных затрат, связанная с действием.
    eosio::asset rate_per_hour = asset(0, _root_govern_symbol); ///< Стоимость часа
    eosio::asset spended = asset(0, _root_govern_symbol); ///< Сумма затрат, связанная с действием.
    eosio::asset generated = asset(0, _root_govern_symbol); ///< Сумма генерации, связанная с действием.
    eosio::asset creators_bonus = asset(0, _root_govern_symbol); ///< Сумма затрат, связанная с действием.
    eosio::asset authors_bonus = asset(0, _root_govern_symbol);///< Сумма затрат, связанная с действием.
    eosio::asset capitalists_bonus = asset(0, _root_govern_symbol); ///< Сумма затрат, связанная с действием.
    eosio::asset total = asset(0, _root_govern_symbol); ///< Суммарная стоимость коммита на будущем приёме задания с учетом капитализации и генерации
    
    std::string decline_comment;
    time_point_sec created_at;                   ///< Дата и время создания действия.

    uint64_t primary_key() const { return id; } ///< Основной ключ.
    uint64_t by_username() const { return username.value; } ///< По имени пользователя.
    checksum256 by_commit_hash() const { return commit_hash; } ///< Индекс по хэшу задачи.
    checksum256 by_assignment_hash() const { return assignment_hash; } ///< Индекс по хэшу задания.
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта.
};

typedef eosio::multi_index<
    "commits"_n, commit,
    indexed_by<"byusername"_n, const_mem_fun<commit, uint64_t, &commit::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<commit, checksum256, &commit::by_commit_hash>>,
    indexed_by<"byassignment"_n, const_mem_fun<commit, checksum256, &commit::by_assignment_hash>>,
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

inline eosio::asset get_amount_for_withdraw_from_commit(eosio::name coopname, eosio::name username, const checksum256 &hash) {
  commit_index commits(_capital, coopname.value);
  auto commit_index = commits.get_index<"byhash"_n>();

  auto itr = commit_index.find(hash);
  eosio::check(itr != commit_index.end(), "Коммит не найден");
  eosio::check(itr -> status != "created"_n, "Коммит еще не принят");
  eosio::check(itr -> status == "approved"_n, "Коммит уже погашен");
  eosio::check(itr -> username == username, "Нельзя присвоить чужой коммит");
  
  commit_index.modify(itr, coopname, [&](auto &c){
    c.status = "withdrawed"_n; 
  });
  
  return itr -> spended;
}


} // namespace Capital