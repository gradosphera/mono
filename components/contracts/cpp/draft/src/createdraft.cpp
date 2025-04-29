void draft::createdraft(eosio::name scope, eosio::name username, uint64_t registry_id, eosio::name lang, std::string title, 
                    std::string description, std::string context, std::string model, std::string translation_data) {
  
  eosio::name payer = draft::get_payer_and_check_auth_in_scope(scope, username, "createdraft"_n);
    
  drafts_index drafts(_draft, scope.value);

  // Проверка существующих записей с тем же registry_id
  auto exist = drafts.find(registry_id);
  eosio::check(exist == drafts.end(), "Уже существует шаблон с тем же идентификатором. Обновите его.");
  
  // Создание нового шаблона
  uint64_t translation_id = get_global_id(_draft, "translation"_n);
  
  drafts.emplace(payer, [&](auto &d) {
    d.registry_id = registry_id;
    d.version = 1;
    d.default_translation_id = translation_id;
    d.title = title;
    d.description = description;
    d.context = context;
    d.model = model;
  });

 
  translations_index translations(_draft, scope.value);
 
  translations.emplace(payer, [&](auto &t) {
    t.id = translation_id;
    t.draft_id = registry_id;
    t.lang = lang;
    t.data = translation_data;
  });

  // Отправка действия для обновления идентификаторов
  action(permission_level{_draft, "active"_n}, _draft, "newid"_n,
     std::make_tuple(scope, registry_id))
  .send();
};
