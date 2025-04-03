[[eosio::action]] void soviet::newdeclined(eosio::name coopname, eosio::name username, document document) {
  check_auth_and_get_payer_or_fail({_registrator, _soviet});

  require_recipient(coopname);
  require_recipient(username);

};
