/**
 * @brief Устанавливает плановые показатели проекта.
 *
 * Действие рассчитывает плановые пулы (себестоимости, премии, инвестиции, расходы)
 * на основании входных параметров и текущего конфига кооператива, и сохраняет их в поле `plan` проекта.
 *
 * @ingroup public_actions
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта, для которого устанавливается план.
 * @param plan_creators_hours Планируемое время создателей в часах (> 0).
 * @param plan_expenses Планируемый целевой размер пула расходов (`asset`).
 * @param plan_hour_cost Планируемая стоимость часа создателя (`asset`).
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::setplan(name coopname, name master, checksum256 project_hash, uint64_t plan_creators_hours, asset plan_expenses, asset plan_hour_cost){
  require_auth(coopname);
  
  // Получаем проект 
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  eosio::check(project.master == master, "Мастер проекта не совпадает с мастером, который устанавливает план");
  
  // Проверяем, что проект в статусе "pending"
  eosio::check(project.status == Capital::Projects::Status::PENDING, "Проект должен быть в статусе 'pending'");
  
  Wallet::validate_asset(plan_expenses);
  Wallet::validate_asset(plan_hour_cost);
  
  eosio::check(plan_creators_hours > 0, "План времени должен быть положительным");
  
  // Вычисляем плановые показатели через ядро
  auto calculated_plan = Capital::Core::Generation::calculate_plan_generation_amounts(coopname, plan_hour_cost, plan_creators_hours, plan_expenses);

  // Устанавливаем плановые показатели проекта
  Capital::Projects::set_plan(coopname, project_hash, calculated_plan);
};