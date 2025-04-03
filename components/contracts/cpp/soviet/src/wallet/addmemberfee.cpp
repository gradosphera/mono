
void soviet::addmemberfee(eosio::name coopname, eosio::name username, uint64_t program_id, eosio::asset quantity, std::string memo){
  eosio::check(has_auth(_marketplace) || has_auth(_soviet), "Недостаточно прав доступа");
  auto cooperative = get_cooperative_or_fail(coopname);  
  
  programs_index programs(_soviet, coopname.value);
  auto prg = programs.find(program_id);
  eosio::check(prg != programs.end(), "Программа с указанным program_id не найдена");
  
  auto participant = get_participant_or_fail(coopname, username);
  auto exist_wallet = get_user_program_wallet_or_fail(coopname, username, program_id);
  
  progwallets_index progwallets(_soviet, coopname.value);
  auto wallet = progwallets.find(exist_wallet.id);
  
  progwallets.modify(wallet, _soviet, [&](auto &p) { 
    p.membership_contribution = p.membership_contribution.value_or(asset(0, quantity.symbol)) + quantity;
  });
  
  // Обновляем агрегированный баланс в самой программе (program_id)
  programs.modify(prg, _soviet, [&](auto &p){
    p.membership_contributions = p.membership_contributions.value_or(asset(0, quantity.symbol)) + quantity;
  });
}
