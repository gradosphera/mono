void capital::approvewthd3(name coopname, name application, name approver, checksum256 withdraw_hash, document2 approved_return_statement) {
  check_auth_or_fail(_capital, coopname, application, "approvewthd3"_n);
  
  verify_document_or_fail(approved_return_statement);
  
  auto exist_withdraw = Capital::get_program_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект возврата не найден");
  
  Capital::program_withdraws_index program_withdraws(_capital, coopname.value);
  auto withdraw = program_withdraws.find(exist_withdraw -> id);

  program_withdraws.modify(withdraw, coopname, [&](auto &i) {
    i.status = Capital::ProgramWithdraw::Status::APPROVED;
    i.statement = approved_return_statement;
  });
  
  //отправляем в совет
  ::Soviet::create_agenda(
    _capital,
    coopname, 
    exist_withdraw -> username, 
    Names::SovietActions::CAPITAL_WITHDRAW_FROM_PROGRAM,
    withdraw_hash, 
    _capital, 
    Names::Capital::AUTHORIZE_PROGRAM_WITHDRAW,
    Names::Capital::DECLINE_PROGRAM_WITHDRAW,
    exist_withdraw -> statement, 
    std::string("")
  ); 

};