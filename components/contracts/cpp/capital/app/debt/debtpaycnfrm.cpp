void capital::debtpaycnfrm(name coopname, checksum256 debt_hash) {
  require_auth(_gateway);
  
  // Получаем долг
  auto exist_debt = Capital::Debts::get_debt_or_fail(coopname, debt_hash);
  
  // Обновляем статус долга
  Capital::Debts::update_debt_status(coopname, debt_hash, Capital::Debts::Status::PAID, _gateway);
  
  // Удаляем долг после подтверждения оплаты
  Capital::Debts::delete_debt(coopname, debt_hash);
};