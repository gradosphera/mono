/**
 * @brief Закрывает проект
 * Закрывает завершенный проект:
 * - Проверяет существование проекта
 * - Валидирует что проект в статусе completed
 * - Обновляет статус проекта на closed
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для закрытия
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::closeproject(name coopname, checksum256 project_hash) {
  require_auth(coopname);
  
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  eosio::check(project.status == Capital::Projects::Status::COMPLETED, "Проект должен быть в статусе 'completed'");
  
  Capital::Projects::update_status(coopname, project_hash, Capital::Projects::Status::CLOSED);
}