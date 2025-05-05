void capital::approvewthd3(name coopname, name application, name approver, checksum256 withdraw_hash, document2 approved_return_statement) {
  check_auth_or_fail(_capital, coopname, application, "approvewthd3"_n);
  
  verify_document_or_fail(approved_return_statement);
  
  auto exist_withdraw = get_project_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект возврата не найден");
  
  capital_tables::program_withdraws_index program_withdraws(_capital, coopname.value);
  auto withdraw = program_withdraws.find(exist_withdraw -> id);

  program_withdraws.modify(withdraw, coopname, [&](auto &i) {
    i.status = "approved"_n;
    i.approved_return_statement = approved_return_statement;
  });
  
  //отправляем в совет
  action(permission_level{ _capital, "active"_n}, _soviet, "createagenda"_n,
    std::make_tuple(
      coopname, 
      exist_withdraw -> username, 
      get_valid_soviet_action("capwthdrprog"_n),
      withdraw_hash, 
      _capital, 
      "capauthwthd3"_n,
      "capdeclwthd3"_n,
      exist_withdraw -> return_statement, 
      std::string("")
    )
  ).send(); 

};