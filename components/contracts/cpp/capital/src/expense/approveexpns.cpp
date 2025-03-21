void capital::approveexpns(name coopname, name application, name approver, checksum256 expense_hash, document approved_statement) {
  check_auth_or_fail(_capital, coopname, application, "approveinvst"_n);

  verify_document_or_fail(approved_statement);
  
  auto exist_expense = get_expense(coopname, expense_hash);
  eosio::check(exist_expense.has_value(), "Объект расходов не найден");
  
  expense_index expenses(_capital, coopname.value);
  auto expense = expenses.find(exist_expense -> id);
  
  expenses.modify(expense, coopname, [&](auto &i) {
    i.status = "approved"_n;
    i.approved_statement = approved_statement;
  });
  
  auto contributor = get_active_contributor_or_fail(coopname, expense -> project_hash, expense -> username);
  
  auto exist_result = get_result(coopname, expense -> result_hash);
  eosio::check(exist_result.has_value(),"Результат не найден");
  eosio::check(exist_result -> available >= expense -> amount, "Недостаточно средств в результате для списания расходов");

  result_index results(_capital, coopname.value);
  auto result = results.find(exist_result -> id);
  
  results.modify(result, coopname, [&](auto &r){
    r.available -= expense -> amount;
  });  
  
  //отправляем в совет
  action(permission_level{ _capital, "active"_n}, _soviet, "createagenda"_n,
    std::make_tuple(coopname, expense -> username, _capital, _capital_expense_authorize_action, expense -> id, expense -> expense_statement, std::string("")))
  .send();  

}