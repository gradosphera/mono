void capital::approverslt(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 result_hash, document2 approved_statement){
  require_auth(coopname);
  
  verify_document_or_fail(approved_statement);
  
  auto exist_result = Capital::get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Результат пользователя не существует");
  
  Capital::result_index results(_capital, coopname.value);
  auto result = results.find(exist_result -> id);
  
  results.modify(result, coopname, [&](auto &a) {
    a.status = "approved"_n;
    a.approved_statement = approved_statement;
  });
  
  //отправляем в совет
  Action::send<createagenda_interface>(
    _soviet,
    "createagenda"_n,
    _capital,
    coopname, 
    result -> username, 
    get_valid_soviet_action("createresult"_n), 
    result -> result_hash,
    _capital, 
    "authrslt"_n, 
    "declrslt"_n, 
    result -> result_statement, 
    std::string("")
  );

  
};