void capital::capauthwthd2(eosio::name coopname, uint64_t withdraw_id, document authorization) {
  require_auth(_soviet);
  
  capital_tables::project_withdraws_index project_withdraws(_capital, coopname.value);
  auto withdraw = project_withdraws.find(withdraw_id);
  eosio::check(withdraw != project_withdraws.end(), "Объект возврата не найден");

  auto exist_contributor = capital::get_active_contributor_or_fail(coopname, withdraw -> project_hash, withdraw -> username);
  
  contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  
  contributors.modify(contributor, coopname, [&](auto &c) {
    c.returned += withdraw -> amount;
  });
  
  project_withdraws.modify(withdraw, _capital, [&](auto &w){
    w.authorized_return_statement = authorization;
  });

  // списание с капитализации
  Wallet::sub_blocked_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _capital_program);
  
  // добавление в кошелёк
  Wallet::add_available_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _wallet_program);
  
  project_withdraws.erase(withdraw);
  
}