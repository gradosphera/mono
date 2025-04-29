void draft::createtrans(eosio::name scope, eosio::name username, uint64_t registry_id, eosio::name lang, std::string data) {
  eosio::name payer = draft::get_payer_and_check_auth_in_scope(scope, username, "createtrans"_n);
  
  drafts_index drafts(_draft, scope.value);
  auto draft = drafts.find(registry_id);
  eosio::check(draft != drafts.end(), "Документ не найден");
  
  translations_index translations(_draft, scope.value);
  
  auto trans_index_by_draft_and_lang = translations.template get_index<"bydraftlang"_n>();
  
  auto trans_combined_index = combine_ids(registry_id, lang.value);
  auto trans = trans_index_by_draft_and_lang.find(trans_combined_index);
  eosio::check(trans == trans_index_by_draft_and_lang.end(), "Перевод уже создан для документа");

  uint64_t translation_id = get_global_id(_draft, "translation"_n);

  translations.emplace(payer, [&](auto &d){
    d.id = translation_id;
  }); 
};
