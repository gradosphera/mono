// действие авторизации возврата вызывается после получения авторизаций совета на взнос и возврат взноса
void capital::authwithdrw1(eosio::name coopname, checksum256 withdraw_hash) {
  require_auth(_capital);
  
  auto exist_withdraw = get_result_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект взноса-возврата не найден");
  
  capital_tables::result_withdraws_index result_withdraws(_capital, coopname.value);
  auto withdraw = result_withdraws.find(exist_withdraw -> id);
  
  //обновить сумму выводов по проекту
  auto exist_project = get_project(coopname, withdraw -> project_hash);
  project_index projects(_capital, coopname.value);
  auto project = projects.find(exist_project->id);
  
  projects.modify(project, _capital, [&](auto &p){
    p.spend += withdraw -> amount;
  });
  
  auto exist_contributor = capital::get_active_contributor_or_fail(coopname, withdraw -> project_hash, withdraw -> username);
  
  contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  
  contributors.modify(contributor, coopname, [&](auto &c) {
    c.withdrawed += withdraw -> amount;
  });
  
  
  // списание с УХД
  Wallet::sub_blocked_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _cofund_program);
  
  // добавление в кошелёк
  Wallet::add_available_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _wallet_program);
  
  result_withdraws.erase(withdraw);
}