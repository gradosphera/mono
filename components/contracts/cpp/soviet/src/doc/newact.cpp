[[eosio::action]] void soviet::newact(eosio::name coopname, eosio::name username, eosio::name action, checksum256 hash, document2 document) {
  require_auth(_soviet);
  
  require_recipient(coopname);
  require_recipient(username);
};
