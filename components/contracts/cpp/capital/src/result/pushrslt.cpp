void capital::pushrslt(name coopname, name application, checksum256 result_hash, document2 statement) {
  require_auth(coopname);

  // проверяем заявление
  verify_document_or_fail(statement);

  // извлекаем клайм
  auto result = get_result(coopname, result_hash);
  eosio::check(result.has_value(), "Объект результата не найден");
  eosio::check(result -> status == "created"_n, "Неверный статус результата");
  
  // обновляем клайм, добавляя заявление
  result_index results(_capital, coopname.value);
  auto result_for_modify = results.find(result->id);
  
  results.modify(result_for_modify, coopname, [&](auto &c){
    c.status = "statement"_n;
    c.result_statement = statement;
  }); 
}
