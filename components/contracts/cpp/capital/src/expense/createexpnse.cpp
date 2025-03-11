void capital::createexpnse(eosio::name coopname, eosio::name application, checksum256 expense_hash, checksum256 result_hash, name creator, uint64_t fund_id, asset amount, std::string description, document statement){
  check_auth_or_fail(_capital, coopname, application, "createexpns"_n);
  
  verify_document_or_fail(statement);
  
  check(amount.symbol == _root_govern_symbol, "Invalid token symbol");
  check(amount.is_valid(), "Invalid asset");
  check(amount.amount > 0, "Amount must be positive");
  
  result_index results(_capital, coopname.value);
  auto result = get_result(coopname, result_hash);
  eosio::check(result.has_value(), "Объект результата не существует");
  
  auto contributor = get_active_contributor_or_fail(coopname, result -> project_hash, creator);  

  auto exist_expense = get_expense(coopname, expense_hash);
  eosio::check(!exist_expense.has_value(), "Расход с указанным хэшем уже существует");
    
  // добавляем запись в таблицу расходов
  expense_index expenses(_capital, coopname.value);
  uint64_t expense_id = get_global_id_in_scope(_capital, coopname, "expenses"_n);
  
  expenses.emplace(coopname, [&](auto &i) {
    i.id = expense_id;
    i.coopname = coopname;
    i.application = application;
    i.username = creator;
    i.project_hash = result -> project_hash;
    i.result_hash = result_hash;
    i.expense_hash = expense_hash;
    i.fund_id = fund_id;
    i.status = "created"_n;
    i.spend_at = current_time_point();
    i.statement = statement;
    i.amount = amount;    
    i.description = description;    
  });
  
}