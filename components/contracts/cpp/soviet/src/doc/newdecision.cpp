[[eosio::action]] void soviet::newdecision(NEWDECISION_SIGNATURE) {
  require_auth(_soviet);

  require_recipient(coopname);
  require_recipient(username);

};
