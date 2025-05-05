[[eosio::action]] void registrator::disbranches(eosio::name coopname) {
  require_auth(_branch);
  auto cooperative = get_cooperative_or_fail(coopname);
  
  cooperatives2_index coops(_registrator, _registrator.value);
  auto coop = coops.find(coopname.value);
  
  coops.modify(coop, _branch, [&](auto &c){
    c.is_branched = false;
  });
};

