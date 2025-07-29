void capital::createwthd1(eosio::name coopname, eosio::name application, eosio::name username, checksum256 assignment_hash, checksum256 withdraw_hash, asset amount, document2 return_statement) {
  check_auth_or_fail(_capital, coopname, application, "createwthd1"_n);
  
  verify_document_or_fail(return_statement);
  
  Wallet::validate_asset(amount);
  
  auto exist_assignment = Capital::get_assignment(coopname, assignment_hash);
  eosio::check(exist_assignment.has_value(), "Задание с указанным хэшем не найден");
  
  auto exist_project = Capital::get_project(coopname, exist_assignment -> project_hash);
  eosio::check(exist_project.has_value(), "Проект с указанным хэшем не найден");
  
  //обновить сумму выводов по проекту
  Capital::project_index projects(_capital, coopname.value);
  auto project = projects.find(exist_project->id);
  
  projects.modify(project, _capital, [&](auto &p){
    p.withdrawed += amount;
  });
  
  auto exist_contributor = Capital::get_active_contributor_or_fail(coopname, exist_assignment -> project_hash, username);
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  
  contributors.modify(contributor, coopname, [&](auto &c) {
    c.withdrawed += amount;
  });

  auto exist_creauthor = Capital::get_creauthor_or_fail(coopname, exist_assignment -> assignment_hash, username, "Объект актора в результате не найден");
  
  Capital::creauthor_index creathors(_capital, coopname.value);
  auto creauthor = creathors.find(exist_creauthor.id);
  
  eosio::check(creauthor -> available >= amount, "Недостаточно средств для создания возврата");
  
  creathors.modify(creauthor, coopname, [&](auto &ra) {
    ra.available -= amount;
  }); 
  
  Capital::assignment_index assignments(_capital, coopname.value);
  auto assignment = assignments.find(exist_assignment -> id);
  
  auto exist_withdraw = Capital::get_result_withdraw(coopname, withdraw_hash);
  
  eosio::check(!exist_withdraw.has_value(), "Заявка на возврат с таким хэшем уже существует");
  
  Capital::result_withdraws_index result_withdraws(_capital, coopname.value);
  
  result_withdraws.emplace(coopname, [&](auto &w) {
    w.id = get_global_id_in_scope(_capital, coopname, "withdraws1"_n);
    w.coopname = coopname;
    w.withdraw_hash = withdraw_hash;
    w.assignment_hash = assignment_hash;
    w.project_hash = exist_assignment -> project_hash;
    w.username = username;
    w.amount = amount;
    w.return_statement = return_statement;
  });
  
};