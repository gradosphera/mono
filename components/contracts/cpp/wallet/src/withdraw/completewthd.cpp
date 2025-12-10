void wallet::completewthd(COMPLETEWTHD_SIGNATURE) {
  require_auth(_gateway);
  
  auto exist = Wallet::get_withdraw(coopname, withdraw_hash);
  check(exist.has_value(), "Объект процессинга не найден");
  
  Wallet::withdraws_index withdraws(_wallet, coopname.value);
  auto withdraw = withdraws.find(exist -> id);
  
  eosio::check(withdraw -> status == "authorized"_n, "Только принятые заявления на вывод могут быть обработаны");
  
  std::string memo_in = "Возврат части паевого взноса по ЦПП 'Цифровой Кошелёк' пайщику с username=" + withdraw -> username.to_string();
  
  Ledger::sub(_wallet, coopname, Ledger::accounts::SHARE_FUND, withdraw -> quantity, memo_in, withdraw_hash, withdraw -> username);
  Ledger::sub(_wallet, coopname, Ledger::accounts::BANK_ACCOUNT, withdraw -> quantity, memo_in, withdraw_hash, withdraw -> username);
  
  Wallet::sub_blocked_funds(_wallet, coopname, withdraw -> username, withdraw -> quantity, _wallet_program, memo_in);
  
  withdraws.erase(withdraw);
}
