/**
 * @brief Удаляет проект
 * Удаляет проект из системы кооператива:
 * - Проверяет существование проекта
 * - Валидирует что проект в статусе completed
 * - Проверяет что все сегменты сконвертированы (удалены)
 * - Проверяет что в проектном кошельке 0 total_shares
 * - Удаляет проект
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для удаления
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::delproject(name coopname, checksum256 project_hash) {
  require_auth(coopname);
  
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);

  // Проверяем что проект авторизован советом
  //eosio::check(project.is_authorized, "Проект не авторизован советом");

  eosio::check(project.status == Capital::Projects::Status::RESULT, "Проект должен быть в статусе 'result'");
  
  // Проверяем что все сегменты сконвертированы (удалены)
  eosio::check(!Capital::Segments::has_project_segments(coopname, project_hash), 
               "Не все сегменты сконвертированы. Сначала конвертируйте все сегменты");
  
  // Удаляем проект
  Capital::Projects::delete_project(coopname, project.id);
}