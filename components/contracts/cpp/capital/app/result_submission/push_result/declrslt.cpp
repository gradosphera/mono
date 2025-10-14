/**
 * @brief Отклоняет результат участника советом
 * Отклоняет результат участника советом и возвращает статус сегмента:
 * - Проверяет подлинность документа решения совета
 * - Валидирует статус результата (должен быть approved)
 * - Удаляет объект результата и возвращает статус сегмента в ready
 * @param coopname Наименование кооператива
 * @param result_hash Хеш результата для отклонения
 * @param reason Причина отклонения
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::declrslt(eosio::name coopname, checksum256 result_hash, std::string reason) {
  require_auth(_soviet);
  
  // Получаем результат и проверяем статус
  auto exist_result = Capital::Results::get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Объект результата не найден");
  eosio::check(exist_result->status == Capital::Results::Status::APPROVED || exist_result -> status == Capital::Results::Status::CREATED, "Неверный статус результата");

  // Удаляем объект результата
  Capital::Results::delete_result(coopname, exist_result->project_hash, exist_result->username);
  
  // Возвращаем статус сегмента в READY для возможности повторного внесения результата
  Capital::Segments::update_segment_status(coopname, exist_result->project_hash, exist_result->username, Capital::Segments::Status::READY);
};