/**
 * @brief Подтверждает оплату выданной ссуды.
 * Подтверждает оплату выданной ссуды и переводит долг в статус PAID:
 * @param coopname Наименование кооператива
 * @param debt_hash Хеш-идентификатор ссуды для подтверждения оплаты
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p _gateway
 */
void capital::debtpaycnfrm(name coopname, checksum256 debt_hash) {
  require_auth(_gateway);

  // Получаем долг
  auto exist_debt = Capital::Debts::get_debt_or_fail(coopname, debt_hash);

  // Проверяем что долг в статусе 'authorized' (готов к выплате)
  eosio::check(exist_debt.status == Capital::Debts::Status::AUTHORIZED,
               "Долг должен быть в статусе 'authorized' для подтверждения оплаты");

  // Обновляем статус долга на PAID
  Capital::Debts::update_debt_status(coopname, debt_hash, Capital::Debts::Status::PAID, _gateway);

  // Увеличиваем долг contributor (теперь долг активен и должен быть погашен через внесение результата)
  Capital::Contributors::increase_debt_amount(coopname, exist_debt.username, exist_debt.amount);
};