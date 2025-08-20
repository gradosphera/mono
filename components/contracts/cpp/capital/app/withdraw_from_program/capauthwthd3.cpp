/**
 * @brief Авторизует возврат из программы капитализации советом
 * Авторизует возврат из программы капитализации советом и выполняет операции с балансами:
 * - Получает объект возврата
 * - Списывает заблокированные средства из программы капитализации
 * - Добавляет доступные средства в кошелек программы
 * - Удаляет объект возврата
 * @param coopname Наименование кооператива
 * @param withdraw_hash Хеш заявки на возврат для авторизации
 * @param authorization Документ авторизации совета
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_capauthwthd3
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::capauthwthd3(name coopname, checksum256 withdraw_hash, document2 authorization) {
  require_auth(_soviet);
  
  auto exist_withdraw = Capital::get_program_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект возврата не найден");
  
  Capital::program_withdraws_index program_withdraws(_capital, coopname.value);
  auto withdraw = program_withdraws.find(exist_withdraw -> id);
  
  eosio::check(withdraw != program_withdraws.end(), "Объект возврата не найден");

  std::string memo = Capital::Memo::get_program_withdraw_memo(withdraw -> id);

  Wallet::sub_blocked_funds(_capital, coopname, withdraw->username, withdraw->amount, _capital_program, memo);
  Wallet::add_available_funds(_capital, coopname, withdraw->username, withdraw->amount, _wallet_program, memo);

  program_withdraws.erase(withdraw);
}