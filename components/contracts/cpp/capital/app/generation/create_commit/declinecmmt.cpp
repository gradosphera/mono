/**
 * @brief Отклоняет коммит в проект
 * Отклоняет коммит через систему советского одобрения и удаляет его из базы данных:
 * - Получает коммит по хэшу одобрения
 * - Удаляет коммит из базы данных с указанием причины
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя, отклонившего коммит
 * @param approval_hash Хеш одобрения (совпадает с хэшем коммита)
 * @param reason Причина отклонения коммита
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от контракта совета
 */
void capital::declinecmmt(eosio::name coopname, eosio::name username, checksum256 approval_hash, std::string reason) {
  require_auth(_soviet);

  // Получаем коммит по хэшу одобрения (approval_hash совпадает с commit_hash)
  auto commit = Capital::Commits::get_commit_or_fail(coopname, approval_hash);

  // Получаем проект для проверки
  auto project = Capital::Projects::get_project_or_fail(coopname, commit.project_hash);

  // Удаляем коммит
  Capital::Commits::delete_commit(coopname, approval_hash);
}
