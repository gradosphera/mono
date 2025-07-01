void wallet::completewthd(COMPLETEWTHD_SIGNATURE) {
  require_auth(_gateway);
  
  auto exist = Wallet::get_withdraw(coopname, withdraw_hash);
  check(exist.has_value(), "Объект процессинга не найден");
  
  Wallet::withdraws_index withdraws(_wallet, coopname.value);
  auto withdraw = withdraws.find(exist -> id);
  
  eosio::check(withdraw -> status == "authorized"_n, "Только принятые заявления на вывод могут быть обработаны");

  action(
    permission_level{ _wallet, "active"_n},
    _fund,
    "subcirculate"_n,
    std::make_tuple(coopname, withdraw -> quantity, false)
  ).send();
  
  std::string memo_in = "Возврат части паевого взноса по ЦПП 'Цифровой Кошелёк'";
  Wallet::sub_blocked_funds(_wallet, coopname, withdraw -> username, withdraw -> quantity, _wallet_program, memo_in);
  
  withdraws.erase(withdraw);
}
