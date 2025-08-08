void capital::signact1(eosio::name coopname, eosio::name application, checksum256 result_hash, document2 act) {
  check_auth_or_fail(_capital, coopname, application, "signact1"_n);
  
  // Проверяем документ
  verify_document_or_fail(act);

  // Проверяем результат и права
  auto exist_result = Capital::Results::get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Объект результата не найден");
  eosio::check(exist_result->status == Capital::Results::Status::AUTHORIZED, "Неверный статус. Результат должен быть авторизован советом");
  eosio::check(exist_result->username == application, "Только участник может подписать акт для своего результата");

  // Устанавливаем первый акт
  Capital::Results::set_result_act1(coopname, result_hash, act);
  
  // Обновляем статус
  Capital::Results::update_result_status(coopname, result_hash, Capital::Results::Status::ACT1);
};