[[eosio::action]] void soviet::selectbranch(eosio::name coopname, eosio::name username, eosio::name braname, document2 document){
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
  checksum256 hash = document.hash;
  
  Action::send<newsubmitted_interface>(
    _soviet,
    "newsubmitted"_n,
    _soviet,
    coopname,
    username,
    "selectbranch"_n,
    hash,
    document
  );
  
  // отправляем документ в принятый реестр
  Action::send<newresolved_interface>(
    _soviet,
    "newresolved"_n,
    _soviet,
    coopname,
    username,
    "selectbranch"_n,
    hash,
    document
  );
}