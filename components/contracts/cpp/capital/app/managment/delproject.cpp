/**
 * @brief Удаляет проект
 * Удаляет проект из системы кооператива:
 * - Проверяет существование проекта
 * - Валидирует что проект в статусе voting
 * - Удаляет проект и все связанные с ним данные
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для удаления
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::delproject(name coopname, checksum256 project_hash) {
  require_auth(coopname);
  
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  eosio::check(project.status == Capital::Projects::Status::VOTING, "Проект должен быть в статусе 'voting'");
  
  //TODO: delete project with check that we are delete everything related to it
}