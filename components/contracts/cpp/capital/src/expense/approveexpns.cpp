void capital::approveexpns(name coopname, name application, name approver, checksum256 expense_hash, document2 approved_statement) {
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
  
  auto exist_assignment = get_assignment(coopname, expense -> assignment_hash);
  eosio::check(exist_assignment.has_value(),"Задание не найдено");
  eosio::check(exist_assignment -> available >= expense -> amount, "Недостаточно средств в результате для списания расходов");

  assignment_index assignments(_capital, coopname.value);
  auto assignment = assignments.find(exist_assignment -> id);
  
  assignments.modify(assignment, coopname, [&](auto &r){
    r.available -= expense -> amount;
  });  
  
  //отправляем в совет
  action(permission_level{ _capital, "active"_n}, _soviet, "createagenda"_n,
    std::make_tuple(
      coopname, 
      expense -> username, 
      get_valid_soviet_action("capresexpns"_n),
      expense_hash, 
      _capital, 
      "capauthexpns"_n,
      "capdeclexpns"_n, 
      expense -> expense_statement, 
      std::string("")
    )
  ).send();  

}