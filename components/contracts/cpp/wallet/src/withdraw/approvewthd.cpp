void wallet::approvewthd(eosio::name coopname, checksum256 withdraw_hash, document approved_statement) {
  require_auth(_soviet);
  
  auto exist_withdraw = Wallet::get_withdraw(coopname, withdraw_hash);  
  eosio::check(exist_withdraw.has_value(), "Объект возврата паевого взноса не найден");
  
  Wallet::withdraws_index withdraws(_wallet, coopname.value);
  auto withdraw = withdraws.find(exist_withdraw -> id);
  
  withdraws.modify(withdraw, _wallet, [&](auto &w){
    w.status = "approved"_n;
    w.approved_statement = approved_statement;
  });
  
  //отправляем в совет
  action(permission_level{ _wallet, "active"_n}, _soviet, "createagenda"_n,
    std::make_tuple(
      coopname, 
      withdraw -> username, 
      get_valid_soviet_action("withdraw"_n), 
      withdraw_hash,
      _wallet, 
      "authwthd"_n, 
      "declinewthd"_n, 
      withdraw -> statement, 
      std::string("")
    )
  ).send();  
  
}