void capital::approveclaim(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 claim_hash, document approved_statement){
  check_auth_or_fail(_capital, coopname, application, "approveclaim"_n);
  
  verify_document_or_fail(approved_statement);
  
  auto exist_claim = get_claim(coopname, claim_hash);
  eosio::check(exist_claim.has_value(), "Действие с указанным хэшем не существует");
  
  auto result = get_result(coopname, exist_claim -> result_hash);
  eosio::check(result.has_value(), "Результат не найден");
  
  eosio::check(result -> status == "created"_n, "Нельзя добавить действие в уже закрытый результат");
  
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