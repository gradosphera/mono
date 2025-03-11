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
};