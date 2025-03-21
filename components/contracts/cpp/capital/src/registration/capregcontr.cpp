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
  
  auto program_wallet = get_program_wallet(coopname, contributor -> username, _source_program);
  
  if (!program_wallet.has_value()) {
    action(permission_level{ _capital, "active"_n}, _soviet, "openprogwall"_n,
      std::make_tuple(coopname, contributor -> username, _source_program, uint64_t(0)))
    .send();
  };
};