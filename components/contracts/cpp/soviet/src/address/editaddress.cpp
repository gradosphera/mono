void soviet::editaddress(eosio::name coopname, eosio::name chairman, eosio::name braname, uint64_t address_id, address_data data){

  require_auth(chairman);

  auto cooperative = get_cooperative_or_fail(coopname);  

  addresses_index addresses(_soviet, coopname.value);
 
  auto address = addresses.find(address_id);
  eosio::check(address != addresses.end(), "Адрес не найден");

  if (braname != ""_n) {
    auto branch = get_branch_or_fail(coopname, braname);
  };

  addresses.modify(address, chairman, [&](auto &a){
    a.braname = braname;
    a.data = data;
  });

}