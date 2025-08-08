void capital::createproj (
  eosio::name coopname, 
  checksum256 project_hash,
  checksum256 parent_hash,
  std::string title, 
  std::string description,
  std::string meta
) {
    require_auth(coopname);
    // Проверяем что проекта с таким хэшем еще не существует
    auto exist = Capital::Projects::get_project(coopname, project_hash);
    eosio::check(!exist.has_value(), "Проект с указанным хэшем уже существует");
    
    // Валидируем parent_hash согласно правилам проектов
    Capital::Projects::validate_parent_hash(coopname, parent_hash);
        
    Capital::Projects::create_project(coopname, project_hash, parent_hash, title, description, meta);
}