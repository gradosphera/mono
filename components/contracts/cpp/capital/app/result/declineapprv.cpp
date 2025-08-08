void capital::declineapprv(eosio::name coopname, checksum256 result_hash, document2 decline_reason) {
  require_auth(coopname);
  
  // Проверяем документ причины отклонения
  verify_document_or_fail(decline_reason);
  
  // Получаем результат и проверяем статус
  auto exist_result = Capital::Results::get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Результат не найден");
  eosio::check(exist_result->status == Capital::Results::Status::CREATED, "Неверный статус результата");
  
  // Удаляем объект результата и возвращаем статус сегмента в ready
  Capital::Results::delete_result_and_reset_segment(coopname, exist_result->project_hash, exist_result->username);
};