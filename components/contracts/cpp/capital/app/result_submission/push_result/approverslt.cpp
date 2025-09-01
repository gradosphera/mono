/**
 * @brief Одобряет результат участника
 * Одобряет результат участника и отправляет в совет:
 * - Проверяет подлинность одобренного заявления
 * - Валидирует статус результата (должен быть created)
 * - Устанавливает одобренное заявление
 * - Обновляет статус на approved
 * - Отправляет результат в совет
 * @param coopname Наименование кооператива
 * @param result_hash Хеш результата для одобрения
 * @param approved_statement Одобренное заявление о результате
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::approverslt(eosio::name coopname, checksum256 result_hash, document2 approved_statement){
  require_auth(_soviet);
  
  // Проверяем заявление
  verify_document_or_fail(approved_statement);
  
  // Проверяем статус результата
  auto exist_result = Capital::Results::get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Результат пользователя не существует");
  eosio::check(exist_result->status == Capital::Results::Status::CREATED, "Неверный статус результата");
  
  // Устанавливаем одобренное заявление
  Capital::Results::set_result_approved_statement(coopname, result_hash, approved_statement);
  
  // Обновляем статус
  Capital::Results::update_result_status(coopname, result_hash, Capital::Results::Status::APPROVED);
  
  // Отправляем в совет
  Capital::Results::send_result_to_soviet(coopname, exist_result->username, result_hash, approved_statement);
};