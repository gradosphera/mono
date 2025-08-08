void capital::exppaycnfrm(eosio::name coopname, checksum256 expense_hash) {
  auto payer = check_auth_and_get_payer_or_fail({ _gateway });
  
  // Получаем расход и проверяем его статус
  auto expense = Capital::Expenses::get_expense_or_fail(coopname, expense_hash);
  eosio::check(expense.status == Capital::Expenses::Status::AUTHORIZED, "Расход должен быть в статусе 'authorized'");
  
  // Проверяем что пользователь зарегистрирован
  auto contributor = Capital::Contributors::get_contributor(coopname, expense.username);
  eosio::check(contributor.has_value(), "Договор УХД с пайщиком по проекту не найден");
  
  // Обновляем used_expense_pool в проекте
  Capital::Projects::complete_expense(coopname, expense.project_hash, expense.amount);
  
  // Удаляем запись расхода
  Capital::Expenses::delete_expense(coopname, expense_hash);
  
  //TODO: здесь должна быть проводка по фонду
}
