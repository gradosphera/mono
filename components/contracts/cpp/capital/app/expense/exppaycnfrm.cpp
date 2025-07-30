void capital::exppaycnfrm(eosio::name coopname, checksum256 expense_hash) {
  auto payer = check_auth_and_get_payer_or_fail({ _gateway });
  
  auto expense = Capital::get_expense(coopname, expense_hash);
  eosio::check(expense.has_value(), "Объект расходов не найден");
  
  auto contributor = Capital::get_contributor(coopname, expense -> username);
  eosio::check(contributor.has_value(), "Договор УХД с пайщиком по проекту не найден");
  
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor_for_modify = contributors.find(contributor -> id);
  
  contributors.modify(contributor_for_modify, payer, [&](auto &c){
    c.expensed += expense -> amount;
  });
  
  auto exist_assignment = Capital::get_assignment(coopname, expense -> assignment_hash);
  eosio::check(exist_assignment.has_value(),"Задание не найдено");
  
  Capital::assignment_index assignments(_capital, coopname.value);
  auto assignment = assignments.find(exist_assignment -> id);
  
  //TODO: make coopname payer
  assignments.modify(assignment, payer, [&](auto &r){
    r.expensed += expense -> amount;
  });  
  
  //обновить сумму расходов по проекту
  auto exist_project = Capital::get_project(coopname, expense -> project_hash);
  Capital::project_index projects(_capital, coopname.value);
  auto project = projects.find(exist_project->id);
  
  projects.modify(project, _capital, [&](auto &p){
    p.expensed += expense -> amount;
  });
  
  Capital::expense_index expenses(_capital, coopname.value);
  auto expense_for_delete = expenses.find(expense -> id);
  
  expenses.erase(expense_for_delete);  
  
  //TODO: здесь должна быть проводка по фонду
}
