/**
 * @brief Одобряет инвестицию в проект
 * Одобряет инвестицию в проект и обрабатывает все связанные операции:
 * - Получает инвестицию и активного пайщика
 * - Добавляет инвестора как генератора с investor_base
 * - Обновляет проект - добавляет инвестиции
 * - Обрабатывает координаторские взносы если есть координатор
 * - Списывает заблокированные средства с кошелька
 * - Пополняет кошелек договора УХД и блокирует средства
 * - Удаляет инвестицию после обработки
 * @param coopname Наименование кооператива
 * @param invest_hash Хеш инвестиции для одобрения
 * @param approved_statement Одобренное заявление об инвестиции
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_approveinvst
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::approveinvst(eosio::name coopname, checksum256 invest_hash, document2 approved_statement) {
  require_auth(_soviet);

  // Получаем инвестицию
  auto invest = Capital::Invests::get_invest_or_fail(coopname, invest_hash);
  
  // Получаем активного пайщика с приложением к проекту
  auto contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, invest.project_hash, invest.username);

  // Добавляем инвестора как генератора с investor_base
  Capital::Core::upsert_investor_segment(coopname, invest.project_hash, invest.username, invest.amount);
    
  // Обновляем проект - добавляем инвестиции
  Capital::Projects::add_investments(coopname, invest.project_hash, invest.amount);
  
  // Обрабатываем координаторские взносы, если есть координатор и сумма
  if (invest.coordinator != eosio::name{} && invest.coordinator_amount.amount > 0) {
    // Создаём сегмент координатора
    Capital::Core::upsert_coordinator_segment(coopname, invest.project_hash, invest.coordinator, invest.coordinator_amount);
    
    // Добавляем координаторский взнос в проект
    Capital::Core::Generation::add_coordinator_funds(coopname, invest.project_hash, invest.coordinator_amount);
    
  }
  
  std::string memo = Capital::Memo::get_approve_invest_memo(contributor -> id);

  // Списываем заблокированные средства с кошелька
  Wallet::sub_blocked_funds(_capital, coopname, contributor -> username, invest.amount, _wallet_program, memo);

  // Пополняем кошелек договора УХД и блокируем средства
  Wallet::add_blocked_funds(_capital, coopname, contributor -> username, invest.amount, _source_program, memo);

  // Удаляем инвестицию после обработки
  Capital::Invests::delete_invest(coopname, invest_hash);
}