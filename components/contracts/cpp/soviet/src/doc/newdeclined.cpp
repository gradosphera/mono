[[eosio::action]] void soviet::newdeclined(eosio::name coopname, eosio::name username, checksum256 hash, document2 document) {
  check_auth_and_get_payer_or_fail(contracts_whitelist);

  require_recipient(coopname);
  require_recipient(username);

};
