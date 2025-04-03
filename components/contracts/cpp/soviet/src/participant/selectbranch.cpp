[[eosio::action]] void soviet::selectbranch(eosio::name coopname, eosio::name username, eosio::name braname, document document){
  require_auth(coopname);
  
  verify_document_or_fail(document);
  get_branch_or_fail(coopname, braname);
  participants_index participants(_soviet, coopname.value);
  auto participant = participants.find(username.value);
  eosio::check(participant != participants.end(), "Пайщик не найден");
  
  participants.modify(participant, coopname, [&](auto &row){
    row.braname = braname;
  });
    
  // отправляем документ во входящий реестр
  action(
    permission_level{ _soviet, "active"_n},
    _soviet,
    "newsubmitted"_n,
    std::make_tuple(coopname, username, "selectbranch"_n, uint64_t(0), document)
  ).send();
  
  // отправляем документ в принятый реестр
  action(
    permission_level{ _soviet, "active"_n},
    _soviet,
    "newresolved"_n,
    std::make_tuple(coopname, username, "selectbranch"_n, uint64_t(0), document)
  ).send();
  
}