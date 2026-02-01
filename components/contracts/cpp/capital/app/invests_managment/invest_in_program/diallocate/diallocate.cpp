/**
 * @brief Деаллоцирует неиспользованные программные инвестиции из проекта
 * Деаллоцирует неиспользованные программные инвестиции из закрытого проекта:
 * - Проверяет что проект закрыт
 * - Проверяет наличие неиспользованных программных средств
 * - Рассчитывает неиспользованную сумму программных средств при коэффициенте > 100%
 * - Возвращает неиспользованные программные средства в глобальный пул
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для деаллокации
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::diallocate(eosio::name coopname, checksum256 project_hash) {
  require_auth(coopname);

  // Проверяем, что проект выполнен
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  eosio::check(project.status == Capital::Projects::Status::RESULT, "Проект должен быть выполнен");

  // Проверяем есть ли неиспользованные программные средства
  eosio::check(project.fact.program_invest_pool.amount > 0, "Нет программных средств для возврата");

  // Неиспользованная сумма программных средств
  // При коэффициенте > 100% часть программных средств не используется
  eosio::asset unused_program_amount = asset(0, _root_govern_symbol);
  
  if (project.fact.use_invest_percent > 100.0) {
    // Рассчитываем фактически использованную сумму программных средств
    eosio::asset used_program_amount = Capital::Core::Generation::calculate_investor_used_amount(
      project.fact.program_invest_pool, 
      project.fact.use_invest_percent
    );
    
    unused_program_amount = project.fact.program_invest_pool - used_program_amount;
  }
  
  if (unused_program_amount.amount > 0) {
    // Возвращаем неиспользованные программные средства в глобальный пул
    Capital::Core::deallocate_program_investment_from_project(coopname, project.id, unused_program_amount);
  }
}