void soviet::block(eosio::name coopname, eosio::name admin, eosio::name username, std::string message) {
  
  //блокировку может выписать контракт или администратор
  auto payer = check_auth_and_get_payer_or_fail({_soviet, admin});
  
  //если администратор - проверяем дополнительно его права
  if (payer == admin)
    check_auth_or_fail(_soviet, coopname, admin, "block"_n);
    
  participants_index participants(_soviet, coopname.value);
  auto participant = participants.find(username.value);
  
  participants.modify(participant, _soviet, [&](auto &row){
      row.status = "blocked"_n;
      row.is_initial = false;
      row.is_minimum = false;
      row.has_vote = false;    
  });
}