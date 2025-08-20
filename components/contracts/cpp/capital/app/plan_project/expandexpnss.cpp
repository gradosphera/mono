/**
 * @brief Расширяет пул расходов проекта
 * Увеличивает целевой размер пула расходов для активного проекта:
 * - Проверяет существование проекта
 * - Валидирует что проект в активном состоянии
 * - Валидирует дополнительные расходы (положительные)
 * - Увеличивает целевой размер пула расходов через доменную логику
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта
 * @param additional_expenses Дополнительные расходы для добавления
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_expandexpnss
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::expandexpnss(name coopname, checksum256 project_hash, asset additional_expenses) {
  require_auth(coopname);
  
  // Получаем проект 
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  // Проверяем, что проект существует и находится в активном состоянии  
  eosio::check(project.status == Capital::Projects::Status::ACTIVE, "Проект не активен");
  
  // Валидируем дополнительные расходы
  Wallet::validate_asset(additional_expenses);
  eosio::check(additional_expenses.amount > 0, "Дополнительные расходы должны быть положительными");
  
  // Увеличиваем целевой размер пула расходов через доменную логику
  Capital::Projects::expand_expense_pool(coopname, project_hash, additional_expenses);
};