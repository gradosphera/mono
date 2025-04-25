[[eosio::action]] void registrator::migrate() {
  require_auth(_registrator);
  
  candidates_index candidates(_registrator, coopname.value);
  auto it = candidates.begin();
  while (it != candidates.end()) {
    candidates.erase(it);
    it = candidates.begin();
  }
}