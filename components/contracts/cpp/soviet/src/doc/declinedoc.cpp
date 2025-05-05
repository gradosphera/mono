[[eosio::action]] void soviet::declinedoc(eosio::name coopname, eosio::name username, checksum256 hash, document2 document) {
  check_auth_or_fail(_soviet, coopname, username, "declinedoc"_n);

  action(
    permission_level{ _soviet, "active"_n},
    _soviet,
    "newdeclined"_n,
    std::make_tuple(coopname, username, hash, document)
  ).send();
};
