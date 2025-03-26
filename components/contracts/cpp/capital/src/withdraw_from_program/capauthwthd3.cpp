void capital::capauthwthd3(name coopname, uint64_t withdraw_id, document authorization) {
  require_auth(_soviet);

  capital_tables::program_withdraws_index program_withdraws(_capital, coopname.value);
  auto withdraw = program_withdraws.find(withdraw_id);
  eosio::check(withdraw != program_withdraws.end(), "Объект возврата не найден");

  std::string memo = "Зачёт части целевого паевого взноса по программе 'Капитализация' в качестве паевого взноса по программе 'Цифровой Кошелёк' с ID: " + std::to_string(withdraw_id);

  Wallet::sub_blocked_funds(_capital, coopname, withdraw->username, withdraw->amount, _capital_program, memo);
  Wallet::add_available_funds(_capital, coopname, withdraw->username, withdraw->amount, _wallet_program, memo);

  program_withdraws.erase(withdraw);
}