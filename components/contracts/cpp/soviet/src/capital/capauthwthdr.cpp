[[eosio::action]] void soviet::capauthwthdr(eosio::name coopname, eosio::name username, uint64_t withdraw_id, document statement, std::string meta) {
  
  require_auth(_capital);
  
  decisions_index decisions(_soviet, coopname.value);
  
  auto decision_id = get_id(_soviet, coopname, "decisions"_n);
  
  decisions.emplace(_soviet, [&](auto &d){
    d.id = decision_id;
    d.coopname = coopname;
    d.username = username;
    d.type = _capital_withdraw_from_result_authorize_return_action;
    d.batch_id = withdraw_id;
    d.statement = statement;
    d.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
    d.expired_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + _decision_expiration);
    d.meta = meta;
  });
  
  action(
    permission_level{ _soviet, "active"_n},
    _soviet,
    "newsubmitted"_n,
    std::make_tuple(coopname, username, _capital_withdraw_from_result_authorize_return_action, decision_id, statement)
  ).send();
}


void soviet::capital_return_on_withdraw_effect(eosio::name executer, eosio::name coopname, uint64_t decision_id) { 

  decisions_index decisions(_soviet, coopname.value);
  auto decision = decisions.find(decision_id);
  
  action(
      permission_level{ _soviet, "active"_n},
      _capital,
      _capital_withdraw_from_result_authorize_return_action,
      std::make_tuple(coopname, decision -> batch_id, decision -> authorization)
  ).send();
  
  action(
      permission_level{ _soviet, "active"_n},
      _soviet,
      "newresolved"_n,
      std::make_tuple(coopname, decision -> username, decision -> type, decision_id, decision -> statement)
  ).send();
  
  action(
      permission_level{ _soviet, "active"_n},
      _soviet,
      "newdecision"_n,
      std::make_tuple(coopname, decision -> username, decision -> type, decision_id, decision -> authorization)
  ).send();

  decisions.erase(decision);

};