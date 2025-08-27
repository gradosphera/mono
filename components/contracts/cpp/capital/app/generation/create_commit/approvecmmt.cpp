/**
 * @brief Одобряет коммит в проект
 * Одобряет коммит от мастера проекта и обрабатывает все связанные операции:
 * - Проверяет что одобрение идет от мастера проекта
 * - Получает коммит
 * - Добавляет коммит к проекту
 * - Обновляет или создает сегмент создателя
 * - Распределяет авторские средства между всеми авторами проекта
 * - Удаляет коммит после обработки
 * @param coopname Наименование кооператива
 * @param master Мастер проекта, одобряющий коммит
 * @param commit_hash Хеш коммита для одобрения
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::approvecmmt(eosio::name coopname, eosio::name master, checksum256 commit_hash) {
  require_auth(coopname);

  // Получаем коммит
  auto commit = Capital::Commits::get_commit_or_fail(coopname, commit_hash);
  
  // Получаем проект и проверяем что мастер является мастером этого проекта
  auto project = Capital::Projects::get_project_or_fail(coopname, commit.project_hash);
  eosio::check(project.master == master, "Только мастер проекта может одобрять коммиты");

  // Добавляем коммит к проекту
  Capital::Projects::add_commit(coopname, commit.project_hash, commit.amounts);

  // Обновляем или создаем сегмент создателя
  Capital::Core::upsert_creator_segment(coopname, commit.project_hash, commit.username, commit.amounts);

  // Распределяем авторские средства между всеми авторами проекта
  Capital::Core::increment_authors_crps_in_project(coopname, commit.project_hash, 
                                   commit.amounts.authors_base_pool, 
                                   commit.amounts.authors_bonus_pool);

  // Удаляем коммит после обработки
  Capital::Commits::delete_commit(coopname, commit_hash);  
};