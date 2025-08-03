void capital::setplan(name coopname, checksum256 project_hash, uint64_t plan_creators_hours, asset plan_expenses, asset plan_hour_cost){
  require_auth(coopname);
  
  // Получаем проект 
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  // Проверяем, что проект в статусе "created"
  eosio::check(project.status == Capital::Projects::Status::CREATED, "Проект должен быть в статусе 'created'");
  
  Wallet::validate_asset(plan_expenses);
  Wallet::validate_asset(plan_hour_cost);
  
  eosio::check(plan_creators_hours > 0, "План времени должен быть положительным");
  eosio::check(plan_hour_cost.amount > 0, "Стоимость нормо-часа должна быть положительной");
  
  // Вычисляем плановые показатели через ядро
  auto calculated_plan = Capital::Core::Generation::calculate_plan_generation_amounts(plan_hour_cost, plan_creators_hours, plan_expenses);

  // Устанавливаем плановые показатели проекта
  Capital::Projects::set_plan(coopname, project_hash, calculated_plan);
};