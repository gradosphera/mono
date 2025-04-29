void draft::edittrans(eosio::name scope, eosio::name username, uint64_t translate_id, std::string data) {
  eosio::name payer = draft::get_payer_and_check_auth_in_scope(scope, username, "edittrans"_n);
  
  translations_index translations(_draft, scope.value);
  auto trans = translations.find(translate_id);
  eosio::check(trans != translations.end(), "Перевод не найден");
  
  translations.modify(trans, _system, [&](auto &t){
    t.data = data;
  });

};
