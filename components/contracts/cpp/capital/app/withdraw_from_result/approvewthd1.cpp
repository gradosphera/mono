void capital::approvewthd1(name coopname, name application, name approver, checksum256 withdraw_hash, document2 approved_return_statement) {
  check_auth_or_fail(_capital, coopname, application, "approvewthd1"_n);
  
  verify_document_or_fail(approved_return_statement);
  
  auto exist_withdraw = Capital::get_result_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект взноса-возврата не найден");
  
  Capital::result_withdraws_index result_withdraws(_capital, coopname.value);
  auto withdraw = result_withdraws.find(exist_withdraw -> id);
    
  result_withdraws.modify(withdraw, coopname, [&](auto &i) {
    i.status = "approved"_n;
    i.approved_return_statement = approved_return_statement;
  });
  
  //отправляем в совет
  action(permission_level{ _capital, "active"_n}, _soviet, "createagenda"_n,
    std::make_tuple(
      coopname, 
      withdraw -> username, 
      get_valid_soviet_action("capwthdrres"_n),
      withdraw_hash, 
      _capital,
      "capauthwthd1"_n,
      "capdeclwthd1"_n,
      withdraw -> return_statement, 
      std::string("")
    )
  ).send();  
    
};