/**
 * @brief Аллоцирует программные инвестиции в проект
 * Аллоцирует средства из глобального пула программных инвестиций в проект:
 * - Валидирует сумму для аллокации
 * - Проверяет существование проекта
 * - Аллоцирует средства из глобального пула в проект
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для аллокации
 * @param amount Сумма для аллокации
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_allocate
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::allocate(eosio::name coopname, checksum256 project_hash, eosio::asset amount) {
  require_auth(coopname);

  Wallet::validate_asset(amount);
  
  // Проверяем существование проекта
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  // Аллоцируем средства из глобального пула в проект
  Capital::Core::allocate_program_investment_to_project(coopname, project_hash, amount);
}