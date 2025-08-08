void capital::signact2(eosio::name coopname, eosio::name application, checksum256 result_hash, document2 act) {
  check_auth_or_fail(_capital, coopname, application, "signact2"_n);
  
  // Проверяем документ
  verify_document_or_fail(act);

  // Проверяем результат и права
  auto exist_result = Capital::Results::get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Объект результата не найден");
  eosio::check(exist_result->status == Capital::Results::Status::ACT1, "Неверный статус. Первый акт должен быть подписан");
  eosio::check(exist_result->username == application, "Только участник может подписать акт для своего результата");

  // Устанавливаем второй акт
  Capital::Results::set_result_act2(coopname, result_hash, act);

  //TODO: линковать документ акта
  
  // Обновляем статус сегмента
  Capital::Segments::update_segment_status(coopname, exist_result->project_hash, exist_result->username, Capital::Segments::Status::ACCEPTED);
  
  // Удаляем объект результата после успешного принятия
  Capital::Results::delete_result(coopname, exist_result->project_hash, exist_result->username);
};