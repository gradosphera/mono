/**
 * @brief Завершает голосование
 * Завершает процесс голосования и переводит проект в завершенный статус:
 * - Проверяет существование проекта
 * - Валидирует что проект в статусе voting
 * - Проверяет что голосование завершено
 * - Обновляет статус проекта на completed
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для завершения голосования
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::cmpltvoting(name coopname, checksum256 project_hash) {
  require_auth(coopname); 
  
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  eosio::check(project.status == Capital::Projects::Status::VOTING, "Проект должен быть в статусе 'voting'");
  
  // Проверяем, что голосование завершено
  eosio::check(Capital::Core::Voting::is_voting_completed(project), "Голосование еще не завершено");
  
  // Обновляем статус проекта на "result"
  Capital::Projects::update_status(coopname, project_hash, Capital::Projects::Status::RESULT);
  
}