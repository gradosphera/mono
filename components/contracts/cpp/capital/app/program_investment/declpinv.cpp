/**
 * @brief Отклоняет программную инвестицию
 * Отклоняет программную инвестицию и разблокирует средства:
 * - Получает программную инвестицию и активного пайщика
 * - Разблокирует средства в кошельке
 * - Удаляет инвестицию после отклонения
 * @param coopname Наименование кооператива
 * @param invest_hash Хеш программной инвестиции для отклонения
 * @param declined_statement Отклоненное заявление об инвестиции
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_declpinv
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::declpinv(eosio::name coopname, checksum256 invest_hash, document2 declined_statement) {
  require_auth(_soviet);

  // Получаем программную инвестицию
  auto invest = Capital::ProgramInvests::get_program_invest_or_fail(coopname, invest_hash);
  
  // Получаем активного пайщика
  auto contributor = Capital::Contributors::get_active_contributor_or_fail(coopname, invest.username);

  std::string memo = Capital::Memo::get_decline_program_invest_memo(contributor -> id);

  // Разблокируем средства в кошельке
  Wallet::unblock_funds(_capital, coopname, contributor -> username, invest.amount, _wallet_program, memo);

  // Удаляем инвестицию после отклонения
  Capital::ProgramInvests::remove_program_invest(coopname, invest_hash);
}