/**
 * @brief Отклоняет результат участника советом
 * Отклоняет результат участника советом и возвращает статус сегмента:
 * - Валидирует статус результата (должен быть created, approved или authorized)
 * - Валидирует статус сегмента (должен быть statement, approved или authorized)
 * - Удаляет объект результата
 * - Возвращает статус сегмента в ready для возможности повторного внесения результата
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
  eosio::check(exist_result->status == Capital::Results::Status::CREATED || 
               exist_result->status == Capital::Results::Status::APPROVED || 
               exist_result->status == Capital::Results::Status::AUTHORIZED, 
               "Результат можно отклонить только в статусах: created, approved или authorized");

  // Проверяем статус сегмента соответствует статусу результата
  auto segment = Capital::Segments::get_segment_or_fail(coopname, exist_result->project_hash, exist_result->username, "Сегмент участника не найден");
  eosio::check(segment.status == Capital::Segments::Status::STATEMENT || 
               segment.status == Capital::Segments::Status::APPROVED || 
               segment.status == Capital::Segments::Status::AUTHORIZED, 
               "Неверный статус сегмента для отклонения");

  // Удаляем объект результата
  Capital::Results::delete_result(coopname, exist_result->id);
  
  // Возвращаем статус сегмента в READY для возможности повторного внесения результата
  Capital::Segments::update_segment_status(coopname, exist_result->project_hash, exist_result->username, Capital::Segments::Status::READY);
};