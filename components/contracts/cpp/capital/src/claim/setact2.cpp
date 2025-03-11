void capital::setact2(eosio::name coopname, eosio::name application, eosio::name owner, checksum256 claim_hash, document act) {
  check_auth_or_fail(_capital, coopname, application, "setact2"_n);

  verify_document_or_fail(act);
  
  auto claim = get_claim(coopname, claim_hash);
  eosio::check(claim.has_value(), "Объект запроса доли не найден");
  eosio::check(claim -> owner == owner, "Неверно указано имя пользователя владельца результата");
  
  auto result = get_result(coopname, claim -> result_hash);
  eosio::check(result.has_value(), "Результат не найден");
    
  auto project = get_project(coopname, result -> project_hash);
  eosio::check(project.has_value(), "Проект не найден");
  
  // Проверяем статус
  eosio::check(claim -> status == "act1"_n, "Неверный статус для поставки акта");
  
  claim_index claims(coopname, coopname.value);
  auto claim_for_modify = claims.find(claim -> id);
  
  claims.modify(claim_for_modify, coopname, [&](auto &n){
    n.status = "act2"_n;
    n.act2 = act;
  });
  //TODO: Wallet::add_blocked_funds(_capital, coopname, username, amount, _capital_program);
};
