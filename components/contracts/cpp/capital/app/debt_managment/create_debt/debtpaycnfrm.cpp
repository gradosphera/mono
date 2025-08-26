/**
 * @brief Подтверждает оплату выданной ссуды. 
 * Подтверждает оплату выданной ссуды и создает объект в контракте loan:
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
  
  // Обновляем статус долга
  Capital::Debts::update_debt_status(coopname, debt_hash, Capital::Debts::Status::PAID, _gateway);
  
  //Создаём объект долга в контракте loan
  ::Loan::create_debt(
    _capital,
    coopname, 
    exist_debt.username, 
    exist_debt.debt_hash, 
    exist_debt.repaid_at,
    exist_debt.amount
  );
  
  // Увеличиваем долг contributor
  Capital::Contributors::increase_debt_amount(coopname, exist_debt.username, exist_debt.amount);
  
  // Удаляем долг после подтверждения оплаты
  Capital::Debts::delete_debt(coopname, debt_hash);
};