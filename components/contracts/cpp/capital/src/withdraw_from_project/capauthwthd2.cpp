void capital::capauthwthd2(name coopname, uint64_t withdraw_id, document authorization) {
  require_auth(_soviet);

  capital_tables::project_withdraws_index project_withdraws(_capital, coopname.value);
  auto withdraw = project_withdraws.find(withdraw_id);
  eosio::check(withdraw != project_withdraws.end(), "Объект возврата не найден");

  std::string memo = "Зачёт части целевого паевого взноса по программе 'Капитализация' в качестве паевого взноса по участию в 'Цифровой Кошелёк'";

  Wallet::sub_blocked_funds(_capital, coopname, withdraw->username, withdraw->amount, _capital_program, memo);
  Wallet::add_available_funds(_capital, coopname, withdraw->username, withdraw->amount, _wallet_program, memo);

  project_withdraws.erase(withdraw);
}