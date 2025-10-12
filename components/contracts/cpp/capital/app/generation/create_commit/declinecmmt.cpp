/**
 * @brief Отклоняет коммит в проект
 * Отклоняет коммит от мастера проекта и удаляет его из базы данных:
 * - Проверяет что отклонение идет от мастера проекта
 * - Получает коммит
 * - Удаляет коммит из базы данных с указанием причины
 * @param coopname Наименование кооператива
 * @param master Мастер проекта, отклоняющий коммит
 * @param commit_hash Хеш коммита для отклонения
 * @param reason Причина отклонения коммита
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::declinecmmt(eosio::name coopname, eosio::name master, checksum256 commit_hash, std::string reason) {
  require_auth(coopname);
  
  // Получаем коммит
  auto commit = Capital::Commits::get_commit_or_fail(coopname, commit_hash);
  
  // Получаем проект и проверяем что мастер является мастером этого проекта
  auto project = Capital::Projects::get_project_or_fail(coopname, commit.project_hash);
  eosio::check(project.master == master, "Только мастер проекта может отклонять коммиты");
  
  // Удаляем коммит
  Capital::Commits::delete_commit(coopname, commit_hash);
}
