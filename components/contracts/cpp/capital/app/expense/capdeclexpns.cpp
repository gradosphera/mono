/**
 * @brief Отклоняет расход в проекте советом
 * Отклоняет расход в проекте советом и возвращает средства в пул:
 * - Получает расход
 * - Возвращает средства в пул расходов проекта
 * - Удаляет запись расхода
 * @param coopname Наименование кооператива
 * @param expense_hash Хеш расхода для отклонения
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_capdeclexpns
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::capdeclexpns(eosio::name coopname, checksum256 expense_hash) {
  require_auth(_soviet);
  
  // Получаем расход
  auto expense = Capital::Expenses::get_expense_or_fail(coopname, expense_hash);
  
  // Возвращаем средства в пул
  Capital::Projects::return_expense_funds(coopname, expense.project_hash, expense.amount);
  
  // Удаляем запись расхода
  Capital::Expenses::delete_expense(coopname, expense_hash);
}