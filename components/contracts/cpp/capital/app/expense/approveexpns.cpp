void capital::approveexpns(name coopname, name application, name approver, checksum256 expense_hash, document2 approved_statement) {
  check_auth_or_fail(_capital, coopname, application, "approveexpns"_n);

  verify_document_or_fail(approved_statement);
  
  // Получаем расход и проверяем его статус
  auto expense = Capital::Expenses::get_expense_or_fail(coopname, expense_hash);
  eosio::check(expense.status == Capital::Expenses::Status::CREATED, "Расход должен быть в статусе 'created'");
  
  // Проверяем что создатель является участником проекта
  auto contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, expense.project_hash, expense.username);
  
  // Одобряем расход (простое обновление статуса)
  Capital::Expenses::set_approved(coopname, expense_hash, approved_statement);
  
  // Отправляем в совет
  ::Soviet::create_agenda(
    _capital,
    coopname, 
    expense.username, 
    Names::SovietActions::CAPITAL_RESOLVE_EXPENSE,
    expense_hash, 
    _capital, 
    Names::Capital::AUTHORIZE_EXPENSE,
    Names::Capital::DECLINE_EXPENSE, 
    expense.expense_statement, 
    std::string("")
  );  
}