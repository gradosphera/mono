[[eosio::action]] void registrator::migrate() {
  require_auth(_registrator);
}