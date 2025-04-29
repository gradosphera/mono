[[eosio::action]] void soviet::newdecision(eosio::name coopname, eosio::name username, eosio::name action, uint64_t decision_id, document document) {
  require_auth(_soviet);

  require_recipient(coopname);
  require_recipient(username);

};
