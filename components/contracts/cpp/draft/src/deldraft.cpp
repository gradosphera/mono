void draft::deldraft(eosio::name scope, eosio::name username, uint64_t registry_id) {
  eosio::name payer = draft::get_payer_and_check_auth_in_scope(scope, username, "deldraft"_n);
  
  drafts_index drafts(_draft, _draft.value);

  auto draft = drafts.find(registry_id);
  eosio::check(draft != drafts.end(), "Шаблон не найден");
  
  drafts.erase(draft);
};
