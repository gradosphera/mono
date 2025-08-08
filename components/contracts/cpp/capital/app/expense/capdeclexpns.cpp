void capital::capdeclexpns(eosio::name coopname, checksum256 expense_hash) {
  require_auth(_soviet);
  
  // Получаем расход
  auto expense = Capital::Expenses::get_expense_or_fail(coopname, expense_hash);
  
  // Возвращаем средства в пул
  Capital::Projects::return_expense_funds(coopname, expense.project_hash, expense.amount);
  
  // Удаляем запись расхода
  Capital::Expenses::delete_expense(coopname, expense_hash);
}