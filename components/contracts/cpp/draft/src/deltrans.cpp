void draft::deltrans(eosio::name scope, eosio::name username, uint64_t translate_id) {
  eosio::name payer = draft::get_payer_and_check_auth_in_scope(scope, username, "deltrans"_n);
  
  translations_index translations(_draft, scope.value);
  
  auto trans = translations.find(translate_id);
  eosio::check(trans != translations.end(), "Объект с переводом не найден");
  
  translations.erase(trans);

};
