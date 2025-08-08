#pragma once

#include "generation_amounts.hpp"

using namespace eosio;
using std::string;

namespace Capital::Commits::Status {
  constexpr eosio::name CREATED = "created"_n;
}

namespace Capital::Commits {

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
    generation_amounts amounts;                  ///< Рассчитанные показатели генерации
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
 * @brief Получает действие по хэшу действия.
 * @param coopname Имя кооператива (scope таблицы).
 * @param hash Хэш действия.
 * @return `commit` - найденное действие.
 */
 inline commit get_commit_or_fail(eosio::name coopname, const checksum256 &hash) {
  auto commit = get_commit(coopname, hash);
  eosio::check(commit.has_value(), "Коммит не найден");

  return commit.value();
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

/**
 * @brief Создает коммит и отправляет его на утверждение.
 * @param coopname Имя кооператива.
 * @param application Приложение, инициировавшее действие.
 * @param username Имя пользователя.
 * @param project_hash Хэш проекта.
 * @param commit_hash Хэш коммита.
 * @param calculated_fact Рассчитанные показатели генерации.
 */
inline void create_commit_with_approve(
  eosio::name coopname,
  eosio::name application,
  eosio::name username,
  checksum256 project_hash,
  checksum256 commit_hash,
  const generation_amounts &calculated_fact
) {
  // Создаем коммит
  commit_index commits(_capital, coopname.value);
  auto commit_id = get_global_id_in_scope(_capital, coopname, "commits"_n);
  
  // Создаем коммит в таблице commits
  commits.emplace(coopname, [&](auto &c) {
    c.id = commit_id;
    c.status = Capital::Commits::Status::CREATED;
    c.coopname = coopname;
    c.application = application;
    c.username = username;
    c.project_hash = project_hash;
    c.commit_hash = commit_hash;
    c.amounts = calculated_fact;
    c.created_at = current_time_point();
  });

  // Создаем пустой документ
  auto empty_doc = document2{};
  
  // Отправляем на approve председателю
  ::Soviet::create_approval(
    _capital,
    coopname,
    username,
    empty_doc,
    Names::Capital::CREATE_COMMIT,
    commit_hash,
    _capital,
    Names::Capital::APPROVE_COMMIT,
    Names::Capital::DECLINE_COMMIT,
    std::string("")
  );
}

} // namespace Capital::Commits