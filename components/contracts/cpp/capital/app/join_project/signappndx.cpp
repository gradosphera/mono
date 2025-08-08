void capital::signappndx(eosio::name coopname, eosio::name application, eosio::name username, checksum256 project_hash, checksum256 appendix_hash, document2 document) {
  require_auth(coopname);
  
  // Проверяем что пользователь подписал общий договор УХД
  auto contributor = Capital::Contributors::get_contributor(coopname, username);
  eosio::check(contributor.has_value(), "Пайщик не подписывал основной договор УХД");
  eosio::check(contributor -> status == Capital::Contributors::Status::PENDING, "Основной договор УХД не активен");
  
  // Проверяем что приложение с таким хэшем не существует
  auto exist_appendix = Capital::get_appendix(coopname, appendix_hash);
  eosio::check(!exist_appendix.has_value(), "Приложение с указанным хэшем уже существует");
  
  // Проверяем что у пользователя нет уже приложения для этого проекта
  eosio::check(!Capital::Contributors::is_contributor_has_appendix_in_project(coopname, project_hash, username), 
               "У пайщика уже есть приложение для данного проекта");
  
  Capital::appendix_index appendixes(_capital, coopname.value);
  auto appendix_id = get_global_id_in_scope(_capital, coopname, "appendixes"_n);
  
  appendixes.emplace(coopname, [&](auto &a) {
    a.id = appendix_id;
    a.coopname = coopname;
    a.username = username;
    a.project_hash = project_hash;
    a.appendix_hash = appendix_hash;
    a.status = Capital::Appendix::Status::CREATED;
    a.created_at = current_time_point();
    a.appendix = document;
  });
  
  // Отправляем на аппрув председателю
  ::Soviet::create_approval(
    _capital,
    coopname,
    username,
    document,
    Names::Capital::CREATE_APPENDIX,
    appendix_hash,
    _capital,
    Names::Capital::APPROVE_APPENDIX,
    Names::Capital::DECLINE_APPENDIX,
    std::string("")
  );
} 