[[eosio::action]] void soviet::capregcontr(eosio::name coopname, eosio::name username, uint64_t contributor_id, document2 statement, std::string meta){
  require_auth(_capital);

  decisions_index decisions(_soviet, coopname.value);
  
  auto decision_id = get_id(_soviet, coopname, "decisions"_n);
  checksum256 hash = eosio::sha256((char*)&decision_id, sizeof(decision_id));
  
  decisions.emplace(_soviet, [&](auto &d) {
    d.id = decision_id;
    d.coopname = coopname;
    d.username = username;
    d.type = _capital_contributor_authorize_action;
    d.batch_id = contributor_id;
    d.statement = statement;
    d.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
    d.expired_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + _decision_expiration);
    d.meta = meta;
    d.hash = hash;
  });
  
  
  Action::send<newsubmitted_interface>(
    _soviet,
    "newsubmitted"_n,
    _soviet,
    coopname,
    username,
    _capital_contributor_authorize_action,
    hash,
    statement
  );
}

void soviet::capital_register_contributor_authorize_action_effect(eosio::name executer, eosio::name coopname, uint64_t decision_id) { 
  decisions_index decisions(_soviet, coopname.value);
  auto decision = decisions.find(decision_id);
  
  action(
    permission_level{ _soviet, "active"_n},
    _capital,
    _capital_contributor_authorize_action,
    std::make_tuple(coopname, decision -> batch_id, decision -> authorization)
  ).send();
  
  
  Action::send<newresolved_interface>(
    _soviet,
    "newresolved"_n,
    _soviet,
    coopname,
    decision -> username,
    decision -> type,
    decision -> hash.value(),
    decision -> statement
  );
  
  Action::send<newdecision_interface>(
    _soviet,
    "newdecision"_n,
    _soviet,
    coopname,
    decision -> username,
    decision -> type,
    decision -> hash.value(),
    decision -> authorization
  );

  decisions.erase(decision);
}
