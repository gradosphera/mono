void capital::createwthd1(eosio::name coopname, eosio::name application, eosio::name username, checksum256 result_hash, checksum256 withdraw_hash, asset amount, document return_statement) {
  check_auth_or_fail(_capital, coopname, application, "createwthd1"_n);
  
  verify_document_or_fail(return_statement);
  
  Wallet::validate_asset(amount);
  
  auto exist_result = get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Результат с указанным хэшем не найден");
  
  auto exist_project = get_project(coopname, exist_result -> project_hash);
  eosio::check(exist_project.has_value(), "Проект с указанным хэшем не найден");
  
  //обновить сумму выводов по проекту
  project_index projects(_capital, coopname.value);
  auto project = projects.find(exist_project->id);
  eosio::check(project -> total_share_balance >= amount, "Недостаточно средств в project.total_share_balance проекта для осуществления возврата");

  projects.modify(project, _capital, [&](auto &p){
    p.withdrawed += amount;
    p.total_share_balance -= amount;
  });
  
  auto exist_contributor = capital::get_active_contributor_or_fail(coopname, exist_result -> project_hash, username);
  contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  eosio::check(contributor -> share_balance >= amount, "Недостаточно средств в contributor.share_balance для осуществления возврата");
  
  contributors.modify(contributor, coopname, [&](auto &c) {
    c.withdrawed += amount;
    c.share_balance -= amount;
  });

  auto exist_resactor = get_resactor_or_fail(coopname, exist_result->result_hash, username, "Объект актора в результате не найден");
  
  resactor_index ractors(_capital, coopname.value);
  auto resactor = ractors.find(exist_resactor.id);
  
  eosio::check(resactor -> available >= amount, "Недостаточно средств для создания возврата");
  eosio::check(resactor -> creators_bonus_shares >= amount.amount, "Недостаточно средств в creators_bonus_shares для создания возврата");
  
  ractors.modify(resactor, coopname, [&](auto &ra) {
    ra.available -= amount;
    ra.creators_bonus_shares -= amount.amount;
  }); 
  
  result_index results(_capital, coopname.value);
  auto result = results.find(exist_result -> id);
  
  eosio::check(result -> total_creators_bonus_shares >= amount.amount, "Недостаточное количество result -> total_creators_bonus_shares для осуществления возврата");

  results.modify(result, coopname, [&](auto &row) {
      row.total_creators_bonus_shares    -= amount.amount; 
  });
    
  auto exist_withdraw = get_result_withdraw(coopname, withdraw_hash);
  
  eosio::check(!exist_withdraw.has_value(), "Заявка на возврат с таким хэшем уже существует");
  
  capital_tables::result_withdraws_index result_withdraws(_capital, coopname.value);
  
  result_withdraws.emplace(coopname, [&](auto &w) {
    w.id = get_global_id_in_scope(_capital, coopname, "withdraws1"_n);
    w.coopname = coopname;
    w.withdraw_hash = withdraw_hash;
    w.result_hash = result_hash;
    w.project_hash = exist_result -> project_hash;
    w.username = username;
    w.amount = amount;
    w.return_statement = return_statement;
  });
};