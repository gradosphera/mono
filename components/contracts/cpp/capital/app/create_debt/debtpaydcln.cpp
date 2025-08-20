/**
 * @brief Отклоняет оплату долга
 * Отклоняет оплату долга и удаляет его из базы данных:
 * - Получает долг
 * - Удаляет долг из базы данных с указанием причины
 * @param coopname Наименование кооператива
 * @param debt_hash Хеш долга для отклонения оплаты
 * @param reason Причина отклонения оплаты долга
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_debtpaydcln
 * @note Авторизация требуется от аккаунта: @p _gateway
 */
void capital::debtpaydcln(name coopname, checksum256 debt_hash, std::string reason) {
  require_auth(_gateway);
  
  // Получаем долг
  auto exist_debt = Capital::Debts::get_debt_or_fail(coopname, debt_hash);
  
  // Удаляем долг 
  Capital::Debts::delete_debt(coopname, debt_hash);
};