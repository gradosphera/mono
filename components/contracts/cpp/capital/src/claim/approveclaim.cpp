void capital::approveclaim(eosio::name coopname, eosio::name application, eosio::name approver, eosio::name username, checksum256 result_hash, document approved_statement){
  check_auth_or_fail(_capital, coopname, application, "approveclaim"_n);
  
  verify_document_or_fail(approved_statement);
  
  auto exist_claim = get_claim(coopname, result_hash, username);
  eosio::check(exist_claim.has_value(), "Клайм пользователя для результата не существует");
  
  auto result = get_result(coopname, result_hash);
  eosio::check(result.has_value(), "Результат не найден");
  
  claim_index claims(_capital, coopname.value);
  auto claim = claims.find(exist_claim -> id);
  
  claims.modify(claim, coopname, [&](auto &a) {
    a.status = "approved"_n;
    a.approved_statement = approved_statement;
  });
  
  //отправляем в совет
  action(permission_level{ _capital, "active"_n}, _soviet, "createagenda"_n,
    std::make_tuple(coopname, claim -> username, _capital, _capital_claim_authorize_action, claim -> id, claim -> claim_statement, std::string("")))
  .send();  
  
};