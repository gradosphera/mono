/**
 * @brief Создает долг в проекте
 * Создает долг в проекте с проверкой доступности средств и отправляет на одобрение:
 * - Проверяет подлинность заявления о долге
 * - Валидирует сумму долга
 * - Проверяет существование участника в проекте
 * - Валидирует актуальность сегмента (CRPS обновлен)
 * - Проверяет доступность средств для ссуды
 * - Обновляет debt_amount в сегменте
 * - Создает долг во внутренней таблице
 * - Создает аппрув для долга
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-заемщика
 * @param project_hash Хеш проекта
 * @param debt_hash Хеш долга
 * @param amount Сумма долга
 * @param repaid_at Дата погашения долга
 * @param statement Заявление о долге
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_createdebt
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::createdebt(name coopname, name username, checksum256 project_hash, checksum256 debt_hash, asset amount, time_point_sec repaid_at, document2 statement) {
  require_auth(coopname);
  
  verify_document_or_fail(statement, {username});
  Wallet::validate_asset(amount);
  
  // Проверяем что участник существует в проекте
  auto exist_contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, project_hash, username);
  eosio::check(exist_contributor.has_value(), "Договор УХД с пайщиком не найден");
  
  // Проверяем что сегмент существует и обновлен
  auto exist_segment = Capital::Segments::get_segment(coopname, project_hash, username);
  eosio::check(exist_segment.has_value(), "Сегмент не найден");
  
  // Проверяем что сегмент обновлен (CRPS актуален)
  Capital::Segments::check_segment_is_updated(coopname, project_hash, username, 
    "Сегмент не обновлен. Выполните rfrshsegment перед получением ссуды");
  
  // Проверяем доступность средств для ссуды
  eosio::check(exist_segment -> provisional_amount >= amount, "Недостаточно доступных средств для получения ссуды");
  eosio::check(exist_segment -> debt_amount + amount <= exist_segment->provisional_amount, 
    "Сумма долга не может превышать доступную сумму залога в provisional_amount");
  
  // Обновляем debt_amount в сегменте
  Capital::Segments::increase_debt_amount(coopname, exist_segment->id, amount);
  
  // Создаем долг во внутренней таблице
  Capital::Debts::create_debt(coopname, username, project_hash, debt_hash, amount, repaid_at, statement);
  
  // Создаем аппрув для долга
  Capital::Debts::create_debt_approval(coopname, username, debt_hash, statement);
  
}