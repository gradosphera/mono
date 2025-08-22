/**
 * @brief Отклонение операции списания от gateway
 * Коллбэк от gateway при отклонении операции
 * @param coopname Наименование кооператива
 * @param writeoff_hash Хэш операции списания для отклонения
 * @param reason Причина отклонения операции
 * @ingroup public_actions
 * @ingroup public_ledger_actions

 * @note Авторизация требуется от аккаунта: @p gateway или @p soviet
 */
[[eosio::action]]
void ledger::decline(eosio::name coopname, checksum256 writeoff_hash, std::string reason) {
  // Может быть вызван от _soviet (отклонение решения) или _gateway (отклонение платежа)
  eosio::check(has_auth(_soviet) || has_auth(_gateway), "Недостаточно прав для отклонения операции");

  auto writeoff_opt = Ledger::get_writeoff_by_hash(writeoff_hash);
  eosio::check(writeoff_opt.has_value(), "Операция не найдена");
  
  auto writeoff = writeoff_opt.value();
  eosio::check(writeoff.coopname == coopname, "Неверный кооператив");

  // Обновляем статус операции
  writeoffs_index writeoffs(_ledger, _ledger.value);
  auto writeoff_iter = writeoffs.find(writeoff.id);
  writeoffs.erase(writeoff_iter);
} 