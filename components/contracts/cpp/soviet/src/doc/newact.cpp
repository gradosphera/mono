[[eosio::action]] void soviet::newact(NEWACT_SIGNATURE) {
  check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  require_recipient(coopname);
  require_recipient(username);
};
