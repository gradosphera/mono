[[eosio::action]] void soviet::declineagree(eosio::name coopname, eosio::name administrator, eosio::name username, uint64_t agreement_id, std::string comment){
  check_auth_or_fail(_soviet, coopname, administrator, "declineagree"_n);
  
  agreements2_index agreements(_soviet, coopname.value);
  auto indoc = agreements.find(agreement_id);
  
  eosio::check(indoc != agreements.end(), "Документ не найден");
  eosio::check(indoc -> username == username, "Имя пользователя не соответствует документу");
  
  agreements.modify(indoc, administrator, [&](auto &d) { 
    d.status = "declined"_n;
  });
  
  checksum256 hash = checksum256();
  
  Action::send<newdeclined_interface>(
    _soviet,
    "newdeclined"_n,
    _soviet,
    coopname,
    username,
    checksum256(),
    indoc -> document
  );
}