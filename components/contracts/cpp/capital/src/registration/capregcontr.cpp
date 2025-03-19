/**
 * @brief Авторизация советом договора УХД.
 * 
 * @param coopname 
 * @param application 
 * @param contributor_id 
 */
void capital::capregcontr(eosio::name coopname, uint64_t contributor_id, document authorization) {
  require_auth(_soviet);
  
  contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(contributor_id);
  
  eosio::check(contributor != contributors.end(), "Договор пайщика не найден");
  
  //TODO make coopname payer after auth delegate to contracts
  contributors.modify(contributor, _soviet, [&](auto &c) {
    c.status = "authorized"_n;
    c.authorization = authorization;
  });
  
  auto program_wallet = get_program_wallet(coopname, contributor -> username, _cofund_program);
  
  if (!program_wallet.has_value()) {
    auto program_id = get_program_id(_cofund_program);

    progwallets_index progwallets(_soviet, coopname.value);

    progwallets.emplace(_soviet, [&](auto &b) {
      b.id = progwallets.available_primary_key();
      b.program_id = program_id;
      b.coopname = coopname;
      b.username = contributor -> username;
      b.agreement_id = 0;
      b.available = asset(0, _root_govern_symbol);      
      b.blocked = asset(0, _root_govern_symbol);
      b.membership_contribution = asset(0, _root_govern_symbol);
    });
  } 
};