void capital::createproj (
  eosio::name coopname, 
  checksum256 project_hash,
  checksum256 parent_project_hash,
  double parent_distribution_ratio,
  std::string title, 
  std::string description,
  std::string meta
) {
  
    require_auth(coopname);
    
    auto exist = Capital::get_project(_capital, project_hash);
    eosio::check(!exist.has_value(), "Проект с указанным хэшем уже существует");
    
    Capital::project_index projects(_capital, coopname.value);    
    
    eosio::check(parent_distribution_ratio >=0 && parent_distribution_ratio <= 1, "parent_distribution_ratio должен быть от 0 до 1");
    
    if (parent_project_hash != checksum256()) {
      // проверяем глубину количества родительский связей проекта
      Capital::validate_project_hierarchy_depth(coopname, parent_project_hash);
    };
    
    if (parent_distribution_ratio > 0)
      eosio::check(parent_project_hash != checksum256(), "Родительский проект должен быть установлен при parent_distribution_ratio > 0");
    
    projects.emplace(coopname, [&](auto& row) {
      row.id = get_global_id_in_scope(_capital, coopname, "projects"_n); 
      row.project_hash = project_hash;
      row.parent_distribution_ratio = parent_distribution_ratio;
      row.coopname = coopname;
      row.title = title;
      row.description = description;
      row.meta = meta;
    });
    
}