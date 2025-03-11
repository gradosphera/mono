
void capital::setstatement(name coopname, name application, name owner, checksum256 claim_hash, document statement) {
  check_auth_or_fail(_capital, coopname, application, "setstatement"_n);

  // проверяем заявление
  verify_document_or_fail(statement);

  // извлекаем клайм
  auto claim = get_claim(coopname, claim_hash);
  eosio::check(claim.has_value(), "Объект запроса доли не найден");
  eosio::check(claim->status == "pending"_n, "Нельзя изменить статус клайма");
  eosio::check(claim -> owner == owner, "Неверно указано имя пользователя владельца результата");
  
  // обновляем клайм, добавляя заявление
  claim_index claims(_capital, coopname.value);
  auto claim_for_modify = claims.find(claim->id);
  
  claims.modify(claim_for_modify, coopname, [&](auto &c){
    c.status = "statement"_n;
    c.statement = statement;
  });

  // Отправляем заявление в совет
  action(permission_level{_capital, "active"_n}, _soviet, "claim"_n, 
      std::make_tuple(coopname, owner, claim->id, statement))
  .send();
}
