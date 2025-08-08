void capital::diallocate(eosio::name coopname, eosio::name application, checksum256 project_hash) {
  require_auth(coopname);

  // Проверяем, что проект закрыт
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  eosio::check(project.status == Capital::Projects::Status::CLOSED, "Проект должен быть закрыт");

  // Проверяем есть ли неиспользованные программные средства
  eosio::check(project.fact.program_invest_pool.amount > 0, "Нет программных средств для возврата");

  // Неиспользованная сумма программных средств
  // При коэффициенте > 1 часть программных средств не используется
  eosio::asset unused_program_amount = asset(0, _root_govern_symbol);
  
  if (project.fact.return_cost_coefficient > 1.0) {
    // Рассчитываем фактически использованную сумму программных средств
    eosio::asset used_program_amount = Capital::Core::Generation::calculate_investor_used_amount(
      project.fact.program_invest_pool, 
      project.fact.return_cost_coefficient
    );
    
    unused_program_amount = project.fact.program_invest_pool - used_program_amount;
  }
  
  if (unused_program_amount.amount > 0) {
    // Возвращаем неиспользованные программные средства в глобальный пул
    Capital::Core::deallocate_program_investment_from_project(coopname, project_hash, unused_program_amount);
  }
}