void capital::setact1(eosio::name coopname, eosio::name application, eosio::name owner, checksum256 claim_hash, document act) {
  check_auth_or_fail(_capital, coopname, application, "setact1"_n);
  
  verify_document_or_fail(act);

  // claims
  auto claim = get_claim(coopname, claim_hash);
  eosio::check(claim.has_value(), "Объект запроса доли не найден");
  eosio::check(claim -> owner == owner, "Неверно указано имя пользователя владельца результата");
  
  auto result = get_result(coopname, claim -> result_hash);
  eosio::check(result.has_value(), "Результат не найден");

  claim_index claims(_capital, coopname.value);
  auto claim_for_modify = claims.find(claim -> id);
  
  // Проверяем статус. 
  eosio::check(result -> status == "decision"_n, "Неверный статус для поставки акта приёма-передачи");
  
  claims.modify(claim_for_modify, coopname, [&](auto &n){
    n.status = "act1"_n;
    n.act1 = act;
  });
};
