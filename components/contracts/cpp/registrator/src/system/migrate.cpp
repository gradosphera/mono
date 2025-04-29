[[eosio::action]] void registrator::migrate() {
  require_auth(_registrator);
  
  
  cooperatives_index coops(_registrator, _registrator.value);

  for (auto coop_it = coops.begin(); coop_it != coops.end(); ++coop_it) {
      eosio::name coopname = coop_it->username;

      Registrator::candidates_index candidates(_registrator, coopname.value);

      auto it = candidates.begin();
      while (it != candidates.end()) {
        candidates.erase(it);
        it = candidates.begin();
      }
  }
}