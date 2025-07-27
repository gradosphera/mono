void capital::authrslt(eosio::name coopname, checksum256 result_hash, document2 decision) {
  require_auth(_soviet);
  
  auto exist_result = get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Объект результата не найден");

  result_index results(_capital, coopname.value);
  auto result = results.find(exist_result -> id);

  // Проверяем статус
  eosio::check(result -> status == "statement"_n, "Неверный статус");

  results.modify(result, _capital, [&](auto &r){
    r.status = "authorized"_n;
    r.authorization = decision;
  });
  
   
};
