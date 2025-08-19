void capital::signact2(eosio::name coopname, eosio::name username, checksum256 result_hash, document2 act) {
  require_auth(coopname);

  auto soviet = get_board_by_type_or_fail(coopname, "soviet"_n);
  auto chairman = soviet.get_chairman();

  eosio::check(username == chairman,
               "Только председатель может принять имущество");
  
  // Проверяем результат и права
  auto exist_result = Capital::Results::get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Объект результата не найден");
  eosio::check(exist_result->status == Capital::Results::Status::ACT1, "Неверный статус. Первый акт должен быть подписан");
  
  // Проверяем документ
  verify_document_or_fail(act, { exist_result->username, username });

  
  // Устанавливаем второй акт
  Capital::Results::set_result_act2(coopname, result_hash, act);

  //TODO: линковать документ акта
  
  // Обновляем статус сегмента
  Capital::Segments::update_segment_status(coopname, exist_result->project_hash, exist_result->username, Capital::Segments::Status::ACCEPTED);
  
  // Удаляем объект результата после успешного принятия
  Capital::Results::delete_result(coopname, exist_result->project_hash, exist_result->username);
};