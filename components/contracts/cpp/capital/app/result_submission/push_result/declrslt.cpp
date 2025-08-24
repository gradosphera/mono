/**
 * @brief Отклоняет результат участника советом
 * Отклоняет результат участника советом и возвращает статус сегмента:
 * - Проверяет подлинность документа решения совета
 * - Валидирует статус результата (должен быть approved)
 * - Удаляет объект результата и возвращает статус сегмента в ready
 * @param coopname Наименование кооператива
 * @param result_hash Хеш результата для отклонения
 * @param decision Документ решения совета
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::declrslt(eosio::name coopname, checksum256 result_hash, document2 decision) {
  require_auth(_soviet);
  
  // Проверяем документ решения
  verify_document_or_fail(decision);
  
  // Получаем результат и проверяем статус
  auto exist_result = Capital::Results::get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Объект результата не найден");
  eosio::check(exist_result->status == Capital::Results::Status::APPROVED, "Неверный статус результата");

  // Удаляем объект результата и возвращаем статус сегмента в ready
  Capital::Results::delete_result_and_reset_segment(coopname, exist_result->project_hash, exist_result->username);
};