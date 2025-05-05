void capital::capauthwthd3(name coopname, checksum256 withdraw_hash, document2 authorization) {
  require_auth(_soviet);
  
  auto exist_withdraw = get_program_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект возврата не найден");
  
  capital_tables::program_withdraws_index program_withdraws(_capital, coopname.value);
  auto withdraw = program_withdraws.find(exist_withdraw -> id);
  
  eosio::check(withdraw != program_withdraws.end(), "Объект возврата не найден");

  std::string memo = "Зачёт части целевого паевого взноса по программе 'Капитализация' в качестве паевого взноса по программе 'Цифровой Кошелёк' с ID: " + std::to_string(withdraw -> id);

  Wallet::sub_blocked_funds(_capital, coopname, withdraw->username, withdraw->amount, _capital_program, memo);
  Wallet::add_available_funds(_capital, coopname, withdraw->username, withdraw->amount, _wallet_program, memo);

  program_withdraws.erase(withdraw);
}