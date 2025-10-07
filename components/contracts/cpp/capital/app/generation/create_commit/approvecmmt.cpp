/**
 * @brief Одобряет коммит в проект
 * Одобряет коммит через систему советского одобрения и обрабатывает все связанные операции:
 * - Получает коммит по хэшу одобрения
 * - Добавляет коммит к проекту
 * - Обновляет или создает сегмент создателя
 * - Распределяет авторские средства между всеми авторами проекта
 * - Удаляет коммит после обработки
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя, одобрившего коммит
 * @param approval_hash Хеш одобрения (совпадает с хэшем коммита)
 * @param approved_document Подтвержденный документ (не используется для коммитов)
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @note Авторизация требуется от контракта совета
 */
void capital::approvecmmt(eosio::name coopname, eosio::name username, checksum256 approval_hash, document2 approved_document) {
  require_auth(_soviet);

  // Получаем коммит по хэшу одобрения (approval_hash совпадает с commit_hash)
  auto commit = Capital::Commits::get_commit_or_fail(coopname, approval_hash);

  // Получаем проект для проверки
  auto project = Capital::Projects::get_project_or_fail(coopname, commit.project_hash);

  // Добавляем коммит к проекту
  Capital::Projects::add_commit(coopname, commit.project_hash, commit.amounts);

  // Обновляем или создаем сегмент создателя
  Capital::Core::upsert_creator_segment(coopname, commit.project_hash, commit.username, commit.amounts);

  // Распределяем авторские средства между всеми авторами проекта
  Capital::Core::increment_authors_crps_in_project(coopname, commit.project_hash,
                                   commit.amounts.authors_base_pool,
                                   commit.amounts.authors_bonus_pool);

  // Распределяем премии вкладчиков между всеми вкладчиками проекта через CRPS
  Capital::Core::increment_contributors_crps_in_project(coopname, commit.project_hash, commit.amounts.contributors_bonus_pool);

  // Удаляем коммит после обработки
  Capital::Commits::delete_commit(coopname, approval_hash);  
};
