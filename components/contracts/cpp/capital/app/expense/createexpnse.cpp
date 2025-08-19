void capital::createexpnse(eosio::name coopname, checksum256 expense_hash, checksum256 project_hash, name creator, asset amount, std::string description, document2 statement){
  require_auth(coopname);
  
  verify_document_or_fail(statement);
  
  Wallet::validate_asset(amount);
  
  eosio::check(amount.amount > 0, "Сумма должна быть положительной");
  
  // Проверяем что создатель является участником проекта
  auto contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, project_hash, creator);  

  // Проверяем что расхода с таким хэшем нет
  auto exist_expense = Capital::get_expense(coopname, expense_hash);
  eosio::check(!exist_expense.has_value(), "Расход с указанным хэшем уже существует");
  
  // Получаем проект и проверяем доступность средств
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  eosio::check(project.fact.accumulated_expense_pool >= amount, 
               "Недостаточно средств в пуле расходов проекта");
  
  // Резервируем средства (уменьшаем accumulated_expense_pool)
  Capital::Projects::reserve_expense_funds(coopname, project_hash, amount);
  
  // Создаем запись расхода
  Capital::Expenses::create_expense(coopname, project_hash, expense_hash, creator, 
                                   amount, description, statement);
}