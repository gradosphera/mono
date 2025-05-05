/**
 * @brief Принимаем запрос на повстку дня для голосования совета о приёме инвестиций по УХД
 */
[[eosio::action]] void soviet::createagenda(eosio::name coopname, eosio::name username, eosio::name type, checksum256 hash, name callback_contract, name confirm_callback, name decline_callback, document2 statement, std::string meta){
  auto payer = check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  decisions_index decisions(_soviet, coopname.value);
  
  auto decision_id = get_id(_soviet, coopname, "decisions"_n);
  
  decisions.emplace(_soviet, [&](auto &d) {
    d.id = decision_id;
    d.coopname = coopname;
    d.username = username;
    d.type = type;
    d.hash = hash;
    d.statement = statement;
    d.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
    d.expired_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + _decision_expiration);
    d.meta = meta;
    d.callback_contract = callback_contract;
    d.confirm_callback = confirm_callback;
    d.decline_callback = decline_callback;
  });
  
  action(
    permission_level{ _soviet, "active"_n},
    _soviet,
    "newsubmitted"_n,
    std::make_tuple(coopname, username, _capital_invest_authorize_action, decision_id, statement)
  ).send();  
}



void soviet::authorize_action_effect(eosio::name executer, eosio::name coopname, uint64_t decision_id) { 
  decisions_index decisions(_soviet, coopname.value);
  auto decision = decisions.find(decision_id);
  
  eosio::check(decision != decisions.end(), "Решение не найдено");
  
  action(
    permission_level{ _soviet, "active"_n},
    decision -> callback_contract.value(),
    decision -> confirm_callback.value(),
    std::make_tuple(coopname, decision -> hash, decision -> authorization)
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
}