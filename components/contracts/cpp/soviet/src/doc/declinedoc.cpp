[[eosio::action]] void soviet::declinedoc(eosio::name coopname, eosio::name username, checksum256 hash, document2 document) {
  check_auth_or_fail(_soviet, coopname, username, "declinedoc"_n);

  Action::send<newdeclined_interface>(
    _soviet,
    "newdeclined"_n,
    _soviet,
    coopname,
    username,
    hash,
    document
  );
};
