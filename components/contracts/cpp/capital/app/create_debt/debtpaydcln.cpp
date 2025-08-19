void capital::debtpaydcln(name coopname, checksum256 debt_hash, std::string reason) {
  require_auth(_gateway);
  
  // Получаем долг
  auto exist_debt = Capital::Debts::get_debt_or_fail(coopname, debt_hash);
  
  // Удаляем долг 
  Capital::Debts::delete_debt(coopname, debt_hash);
};