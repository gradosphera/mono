void soviet::unblockbal(eosio::name coopname, eosio::name username, uint64_t program_id, eosio::asset quantity, std::string memo) {
  name payer = check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  programs_index programs(_soviet, coopname.value);
  auto prg = programs.find(program_id);
  eosio::check(prg != programs.end(), "Программа с указанным program_id не найдена");
  
  auto cooperative = get_cooperative_or_fail(coopname);  
  cooperative.check_symbol_or_fail(quantity);
  
  auto participant = get_participant_or_fail(coopname, username);
  auto exist_wallet = get_user_program_wallet_or_fail(coopname, username, program_id);
  progwallets_index progwallets(_soviet, coopname.value);
  auto wallet = progwallets.find(exist_wallet.id);
  
  eosio::check(wallet -> blocked.value() >= quantity, "Недостаточно средств в блокировке для разблокировки");

  progwallets.modify(wallet, _soviet, [&](auto &w){
    w.available += quantity;
    w.blocked = w.blocked.value_or(asset(0, quantity.symbol)) - quantity;
  });
  
  //разблокируем средства в программе
  eosio::check(prg -> blocked.value() >= quantity, "Недостаточно средств в блокировке программы");
  programs.modify(prg, _soviet, [&](auto &p){
    p.available = p.available.value_or(asset(0, quantity.symbol)) + quantity;
    p.blocked = p.blocked.value_or(asset(0, quantity.symbol)) - quantity;
  });
  
}