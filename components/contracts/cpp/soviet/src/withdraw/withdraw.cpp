
void soviet::withdraw(eosio::name coopname, eosio::name username, uint64_t withdraw_id, document2 statement) { 

  require_auth(_gateway);

  auto cooperative = get_cooperative_or_fail(coopname);  
  
  decisions_index decisions(_soviet, coopname.value);
  auto decision_id = get_id(_soviet, coopname, "decisions"_n);
    
  decisions.emplace(_gateway, [&](auto &d){
    d.id = decision_id;
    d.coopname = coopname;
    d.username = username;
    d.type = _withdraw_action;
    d.batch_id = withdraw_id;
    d.statement = statement;
    d.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
  });

  action(
    permission_level{ _soviet, "active"_n},
    _soviet,
    "newsubmitted"_n,
    std::make_tuple(coopname, username, decision_id)
  ).send();
  
};

void soviet::withdraw_effect(eosio::name executer, eosio::name coopname, uint64_t decision_id, uint64_t batch_id) { 

  decisions_index decisions(_soviet, coopname.value);
  auto decision = decisions.find(decision_id);
  eosio::check(decision != decisions.end(), "Решение не найдено");

  action(
      permission_level{ _soviet, "active"_n},
      _gateway,
      "withdrawauth"_n,
      std::make_tuple(coopname, batch_id)
  ).send();
  
  action(
      permission_level{ _soviet, "active"_n},
      _soviet,
      "newresolved"_n,
      std::make_tuple(coopname, decision -> username, _withdraw_action, decision_id, decision -> statement)
  ).send();
  
  action(
      permission_level{ _soviet, "active"_n},
      _soviet,
      "newdecision"_n,
      std::make_tuple(coopname, decision -> username, _withdraw_action, decision_id, decision -> authorization)
  ).send();

  decisions.erase(decision);
  
}
