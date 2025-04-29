void draft::editdraft(eosio::name scope, eosio::name username, uint64_t registry_id, std::string title, std::string description, std::string context, std::string model){
  eosio::name payer = draft::get_payer_and_check_auth_in_scope(scope, username, "editdraft"_n);
  
  drafts_index drafts(_draft, scope.value);
  auto exist = drafts.find(registry_id);
  
  eosio::check(exist != drafts.end(), "Шаблон не найден");

  drafts.modify(exist, payer, [&](auto &d){
    d.title = title;
    d.description = description;
    d.context = context;
    d.model = model;
  });
}
