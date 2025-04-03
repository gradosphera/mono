void soviet::creaddress(eosio::name coopname, eosio::name chairman, eosio::name braname, address_data data) {

  require_auth(chairman);

  auto cooperative = get_cooperative_or_fail(coopname);  

  if (braname != ""_n) {
    auto branch = get_branch_or_fail(coopname, braname);
  };

  addresses_index addresses(_soviet, coopname.value);
  auto id = get_global_id(_soviet, "addresses"_n);
  
  addresses.emplace(chairman, [&](auto &a){
    a.id = id;
    a.coopname = coopname;
    a.braname = braname;
    a.data = data;
  });

}
