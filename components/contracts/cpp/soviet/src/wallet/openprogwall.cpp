void soviet::openprogwall(name coopname, name username, name program_type, uint64_t agreement_id) {
  name payer = check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  auto program_wallet = get_program_wallet(coopname, username, program_type);
  
  if (!program_wallet.has_value()) {
    auto program_id = get_program_id(program_type);

    if (agreement_id > 0) {
      agreements2_index agreements(_soviet, coopname.value);
      auto agreement = agreements.find(agreement_id);
      check(agreement != agreements.end(), "Соглашение не найдено");  
      check(agreement -> username == username, "Неверный пользователь соглашения и кошелька");
    };
    
    progwallets_index progwallets(_soviet, coopname.value);
    
    //TODO: make payer coopname 
    progwallets.emplace(_soviet, [&](auto &b) {
      b.id = progwallets.available_primary_key();
      b.program_id = program_id;
      b.coopname = coopname;
      b.username = username;
      b.agreement_id = agreement_id;
      b.available = asset(0, _root_govern_symbol);      
      b.blocked = asset(0, _root_govern_symbol);
      b.membership_contribution = asset(0, _root_govern_symbol);
    });
    
  };
};