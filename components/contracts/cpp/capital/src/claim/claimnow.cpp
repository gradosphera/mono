void capital::claimnow(name coopname, name application, name username, checksum256 claim_hash, document statement) {
  require_auth(coopname);

  // проверяем заявление
  verify_document_or_fail(statement);

  // извлекаем клайм
  auto claim = get_claim(coopname, claim_hash);
  eosio::check(claim.has_value(), "Объект запроса доли не найден");
  eosio::check(claim->status == "pending"_n, "Нельзя изменить статус клайма");
  eosio::check(claim -> username == username, "Неверно указано имя пользователя владельца результата");
  
  // обновляем клайм, добавляя заявление
  claim_index claims(_capital, coopname.value);
  auto claim_for_modify = claims.find(claim->id);
  
  claims.modify(claim_for_modify, coopname, [&](auto &c){
    c.status = "statement"_n;
    c.claim_statement = statement;
  });
  
}
