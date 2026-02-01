/**
 * @brief Авторизует результат участника советом
 * Авторизует результат участника советом:
 * - Проверяет подлинность документа решения совета
 * - Валидирует статус результата (должен быть approved) и статус сегмента (должен быть approved)
 * - Устанавливает документ авторизации
 * - Обновляет статус результата на authorized
 * - Обновляет статус сегмента на authorized
 * @param coopname Наименование кооператива
 * @param result_hash Хеш результата для авторизации
 * @param decision Документ решения совета
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::authrslt(eosio::name coopname, checksum256 result_hash, document2 decision) {
  require_auth(_soviet);
  
  // Проверяем заявление
  verify_document_or_fail(decision);
  
  // Проверяем статус результата
  auto exist_result = Capital::Results::get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Объект результата не найден");
  eosio::check(exist_result->status == Capital::Results::Status::APPROVED, "Неверный статус. Результат должен быть одобрен председателем");
  
  // Проверяем статус сегмента
  auto segment = Capital::Segments::get_segment_or_fail(coopname, exist_result->project_hash, exist_result->username, "Сегмент участника не найден");
  eosio::check(segment.status == Capital::Segments::Status::APPROVED, "Неверный статус сегмента. Ожидается статус 'approved'");
  
  // Устанавливаем документ авторизации
  Capital::Results::set_result_authorization(coopname, exist_result -> id, decision);
  
  // Обновляем статус результата
  Capital::Results::update_result_status(coopname, exist_result -> id, Capital::Results::Status::AUTHORIZED);
  
  // Обновляем статус сегмента
  Capital::Segments::update_segment_status(coopname, exist_result->project_hash, exist_result->username, Capital::Segments::Status::AUTHORIZED);
};
