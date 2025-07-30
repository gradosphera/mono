void capital::createexpnse(eosio::name coopname, eosio::name application, checksum256 expense_hash, checksum256 assignment_hash, name creator, uint64_t fund_id, asset amount, std::string description, document2 statement){
  check_auth_or_fail(_capital, coopname, application, "createexpns"_n);
  
  verify_document_or_fail(statement);
  
  check(amount.symbol == _root_govern_symbol, "Invalid token symbol");
  check(amount.is_valid(), "Invalid asset");
  check(amount.amount > 0, "Amount must be positive");
  
  Capital::assignment_index assignments(_capital, coopname.value);
  auto assignment = Capital::get_assignment(coopname, assignment_hash);
  eosio::check(assignment.has_value(), "Объект задананиеа не существует");
  
  auto contributor = Capital::get_active_contributor_with_appendix_or_fail(coopname, assignment -> project_hash, creator);  

  auto exist_expense = Capital::get_expense(coopname, expense_hash);
  eosio::check(!exist_expense.has_value(), "Расход с указанным хэшем уже существует");
    
  // добавляем запись в таблицу расходов
  Capital::expense_index expenses(_capital, coopname.value);
  uint64_t expense_id = get_global_id_in_scope(_capital, coopname, "expenses"_n);
  
  expenses.emplace(coopname, [&](auto &i) {
    i.id = expense_id;
    i.coopname = coopname;
    i.application = application;
    i.username = creator;
    i.project_hash = assignment -> project_hash;
    i.assignment_hash = assignment_hash;
    i.expense_hash = expense_hash;
    i.fund_id = fund_id;
    i.status = "created"_n;
    i.spended_at = current_time_point();
    i.expense_statement = statement;
    i.amount = amount;
    i.description = description;
  });
  
}