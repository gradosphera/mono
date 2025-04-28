[[eosio::action]] void soviet::newsubmitted(eosio::name coopname, eosio::name username, eosio::name action, uint64_t decision_id, document document) {
  check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  require_recipient(coopname);
  require_recipient(username);

};
