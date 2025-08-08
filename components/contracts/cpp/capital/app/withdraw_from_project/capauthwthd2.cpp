void capital::capauthwthd2(name coopname, checksum256 withdraw_hash, document2 authorization) {
  require_auth(_soviet);
  
  auto exist_withdraw = Capital::get_project_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект возврата не найден");
  
  Capital::project_withdraws_index project_withdraws(_capital, coopname.value);
  auto withdraw = project_withdraws.find(exist_withdraw -> id);
  
  std::string memo = Capital::Memo::get_project_withdraw_memo();

  Wallet::sub_blocked_funds(_capital, coopname, withdraw->username, withdraw->amount, _capital_program, memo);
  Wallet::add_available_funds(_capital, coopname, withdraw->username, withdraw->amount, _wallet_program, memo);

  Capital::Projects::distribute_membership_funds(coopname, withdraw->project_hash, withdraw->amount);
  
  project_withdraws.erase(withdraw);
}