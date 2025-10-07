/**
 * @brief Одобряет программную инвестицию
 * Одобряет программную инвестицию и обрабатывает все связанные операции:
 * - Получает программную инвестицию и активного пайщика
 * - Списывает заблокированные средства с кошелька
 * - Пополняет кошелек программы капитализации и блокирует средства
 * - Добавляет средства в глобальный пул доступных инвестиций
 * - Удаляет инвестицию после обработки
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя, одобрившего программную инвестицию
 * @param invest_hash Хеш программной инвестиции для одобрения
 * @param approved_statement Одобренное заявление об инвестиции
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от контракта совета
 */
void capital::apprvpinv(eosio::name coopname, eosio::name username, checksum256 invest_hash, document2 approved_statement) {
  require_auth(_soviet);

  // Получаем программную инвестицию
  auto invest = Capital::ProgramInvests::get_program_invest_or_fail(coopname, invest_hash);
  
  // Получаем активного пайщика
  auto contributor = Capital::Contributors::get_active_contributor_or_fail(coopname, invest.username);

  std::string memo = Capital::Memo::get_approve_program_invest_memo(contributor -> id);

  // Списываем заблокированные средства с кошелька
  Wallet::sub_blocked_funds(_capital, coopname, contributor -> username, invest.amount, _wallet_program, memo);

  // Пополняем кошелек программы капитализации и блокируем средства
  Wallet::add_blocked_funds(_capital, coopname, contributor -> username, invest.amount, _capital_program, memo);

  // Добавляем средства в глобальный пул доступных инвестиций
  Capital::Core::add_program_investment_funds(coopname, invest.amount);

  // Удаляем инвестицию после обработки
  Capital::ProgramInvests::remove_program_invest(coopname, invest_hash);
}