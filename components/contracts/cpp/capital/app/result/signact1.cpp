/**
 * @brief Подписывает акт 1 по результату участника
 * Подписывает первый акт по результату участника:
 * - Проверяет подлинность документа акта от участника
 * - Валидирует статус результата (должен быть authorized)
 * - Проверяет права участника на подписание акта
 * - Устанавливает первый акт
 * - Обновляет статус на act1
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-участника
 * @param result_hash Хеш результата
 * @param act Документ акта 1
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::signact1(eosio::name coopname, eosio::name username, checksum256 result_hash, document2 act) {
  require_auth(coopname);
  
  // Проверяем документ
  verify_document_or_fail(act, {username});

  // Проверяем результат и права
  auto exist_result = Capital::Results::get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Объект результата не найден");
  eosio::check(exist_result->status == Capital::Results::Status::AUTHORIZED, "Неверный статус. Результат должен быть авторизован советом");
  eosio::check(exist_result->username == username, "Только участник может подписать акт для своего результата");

  // Устанавливаем первый акт
  Capital::Results::set_result_act1(coopname, result_hash, act);
  
  // Обновляем статус
  Capital::Results::update_result_status(coopname, result_hash, Capital::Results::Status::ACT1);
};