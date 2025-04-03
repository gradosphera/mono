void draft::upversion(eosio::name scope, eosio::name username, uint64_t registry_id){
  eosio::name payer = draft::get_payer_and_check_auth_in_scope(scope, username, "editdraft"_n);
  
  drafts_index drafts(_draft, scope.value);
  auto exist = drafts.find(registry_id);
  
  eosio::check(exist != drafts.end(), "Шаблон не найден");

  drafts.modify(exist, payer, [&](auto &d){
    d.version = exist -> version + 1;
  });
}
