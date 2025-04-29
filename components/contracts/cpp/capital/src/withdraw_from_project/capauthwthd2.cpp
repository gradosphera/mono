void capital::capauthwthd2(name coopname, checksum256 withdraw_hash, document authorization) {
  require_auth(_soviet);
  
  auto exist_withdraw = get_project_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект возврата не найден");
  
  capital_tables::project_withdraws_index project_withdraws(_capital, coopname.value);
  auto withdraw = project_withdraws.find(exist_withdraw -> id);
  
  std::string memo = "Зачёт части целевого паевого взноса по программе 'Капитализация' в качестве паевого взноса по участию в 'Цифровой Кошелёк'";

  Wallet::sub_blocked_funds(_capital, coopname, withdraw->username, withdraw->amount, _capital_program, memo);
  Wallet::add_available_funds(_capital, coopname, withdraw->username, withdraw->amount, _wallet_program, memo);

  project_withdraws.erase(withdraw);
}