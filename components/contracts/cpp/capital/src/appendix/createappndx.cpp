void capital::createappndx(eosio::name coopname, eosio::name application, eosio::name username, checksum256 project_hash, checksum256 appendix_hash, document2 document) {
  require_auth(application);
  
  // Проверяем что пользователь подписал общий договор УХД
  auto contributor = get_contributor(coopname, project_hash, username);
  eosio::check(contributor.has_value(), "Пайщик не подписывал основной договор УХД");
  eosio::check(contributor -> status == "authorized"_n, "Основной договор УХД не активен");
  
  // Проверяем что приложение с таким хэшем не существует
  auto exist_appendix = get_appendix(coopname, appendix_hash);
  eosio::check(!exist_appendix.has_value(), "Приложение с указанным хэшем уже существует");
  
  // Проверяем что у пользователя нет уже приложения для этого проекта
  eosio::check(!is_contributor_has_appendix_in_project(coopname, project_hash, username), 
               "У пайщика уже есть приложение для данного проекта");
  
  appendix_index appendixes(_capital, coopname.value);
  auto appendix_id = get_global_id_in_scope(_capital, coopname, "appendixes"_n);
  
  appendixes.emplace(application, [&](auto &a) {
    a.id = appendix_id;
    a.coopname = coopname;
    a.username = username;
    a.project_hash = project_hash;
    a.appendix_hash = appendix_hash;
    a.status = "created"_n;
    a.created_at = current_time_point();
    a.document = document;
  });
  
  // Отправляем на аппрув председателю
  Action::send<createapprv_interface>(
    _soviet,
    "createapprv"_n,
    _capital,
    coopname,
    username,
    document,
    appendix_hash,
    _capital,
    "apprvappndx"_n,
    "dclineappndx"_n,
    std::string("")
  );
} 