void capital::approvewthd1(name coopname, name application, name approver, checksum256 withdraw_hash, document approved_contribution_statement, document approved_return_statement) {
  check_auth_or_fail(_capital, coopname, application, "approvewthd1"_n);
  
  verify_document_or_fail(approved_contribution_statement);
  verify_document_or_fail(approved_return_statement);
  
  auto exist_withdraw = get_result_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект взноса-возврата не найден");
  
  capital_tables::result_withdraws_index result_withdraws(_capital, coopname.value);
  auto withdraw = result_withdraws.find(exist_withdraw -> id);
    
  result_withdraws.modify(withdraw, coopname, [&](auto &i) {
    i.status = "approved"_n;
    i.approved_contribution_statement = approved_contribution_statement;
    i.approved_return_statement = approved_return_statement;
  });
  
  //отправляем в совет
  action(permission_level{ _capital, "active"_n}, _soviet, _capital_withdraw_from_result_authorize_contribution_action,
    std::make_tuple(coopname, withdraw -> username, withdraw -> id, withdraw -> contribution_statement, std::string("")))
  .send();  
  
  action(permission_level{ _capital, "active"_n}, _soviet, _capital_withdraw_from_result_authorize_return_action,
    std::make_tuple(coopname, withdraw -> username, withdraw -> id, withdraw -> return_statement, std::string("")))
  .send();
    
};