void capital::createproj (
  checksum256 project_hash,
  checksum256 parent_project_hash,
  double parent_distribution_ratio,
  eosio::name coopname, 
  eosio::name application,
  std::string title, 
  std::string description,
  std::string terms,
  std::string subject
) {
  
    check_auth_or_fail(_capital, coopname, application, "createproj"_n);
    
    auto exist = get_project(_capital, project_hash);
    eosio::check(!exist.has_value(), "Проект с указанным хэшем уже существует");
    
    
    if (parent_project_hash != checksum256()) {
      auto parent_exist = get_project(_capital, parent_project_hash);
      eosio::check(exist.has_value(), "Родительский проект с указанным хэшем не существует");
    };
    
    eosio::check(parent_distribution_ratio >=0 && parent_distribution_ratio <= 1, "parent_distribution_ratio должен быть от 0 до 1");
    
    project_index projects(_capital, coopname.value);    
    projects.emplace(coopname, [&](auto& row) {
      row.id = get_global_id_in_scope(_capital, coopname, "projects"_n); 
      row.project_hash = project_hash;
      row.parent_project_hash = parent_project_hash;
      row.membership_parent_distribution_ratio = parent_distribution_ratio;
      row.coopname = coopname;
      row.application = application;
      row.title = title;
      row.description = description;
      row.terms = terms;
      row.subject = subject;
    });   
}