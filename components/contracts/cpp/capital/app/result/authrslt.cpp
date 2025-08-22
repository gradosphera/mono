/**
 * @brief Авторизует результат участника советом
 * Авторизует результат участника советом:
 * - Проверяет подлинность документа решения совета
 * - Валидирует статус результата (должен быть approved)
 * - Устанавливает документ авторизации
 * - Обновляет статус на authorized
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
  
  // Устанавливаем документ авторизации
  Capital::Results::set_result_authorization(coopname, result_hash, decision);
  
  // Обновляем статус
  Capital::Results::update_result_status(coopname, result_hash, Capital::Results::Status::AUTHORIZED);
};
