void capital::signappndx(eosio::name coopname, eosio::name username, checksum256 project_hash, checksum256 appendix_hash, document2 document) {
  require_auth(coopname);
  
  // Проверяем что пользователь подписал общий договор УХД
  auto contributor = Capital::Contributors::get_contributor(coopname, username);
  eosio::check(contributor.has_value(), "Пайщик не подписывал основной договор УХД");
  eosio::check(contributor -> status == Capital::Contributors::Status::ACTIVE, "Основной договор УХД не активен");
  
  // Проверяем что приложение с таким хэшем не существует
  auto exist_appendix = Capital::Appendix::get_appendix(coopname, appendix_hash);
  eosio::check(!exist_appendix.has_value(), "Приложение с указанным хэшем уже существует");
  
  // Проверяем что у пользователя нет уже приложения для этого проекта
  eosio::check(!Capital::Contributors::is_contributor_has_appendix_in_project(coopname, project_hash, username), 
               "У пайщика уже есть приложение для данного проекта");
  
  // Создаём приложение к договору УХД
  Capital::Appendix::create_appendix(coopname, username, project_hash, appendix_hash, document);
  
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