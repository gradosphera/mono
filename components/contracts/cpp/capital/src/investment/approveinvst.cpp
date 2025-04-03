void capital::approveinvst(name coopname, name application, name approver, checksum256 invest_hash, document approved_statement) {
  check_auth_or_fail(_capital, coopname, application, "approveinvst"_n);
  
  verify_document_or_fail(approved_statement);
  
  auto exist_invest = get_invest(coopname, invest_hash);
  eosio::check(exist_invest.has_value(), "Объект инвестиции не найден");
  
  invest_index invests(_capital, coopname.value);
  auto invest = invests.find(exist_invest -> id);
  
  invests.modify(invest, coopname, [&](auto &i) {
    i.status = "approved"_n;
    i.approved_statement = approved_statement;
  });
  
  //отправляем в совет
  action(permission_level{ _capital, "active"_n}, _soviet, "createagenda"_n,
    std::make_tuple(
      coopname, 
      invest -> username, 
      get_valid_soviet_action("capitalinvst"_n), 
      invest -> invest_hash,
      _capital, 
      "capauthinvst"_n, 
      "capdeclinvst"_n, 
      invest -> invest_statement, 
      std::string("")
    )
  ).send();  
  
};