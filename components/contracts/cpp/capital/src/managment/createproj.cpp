void capital::createproj (
  checksum256 project_hash,
  eosio::name coopname, 
  eosio::name application,
  std::string title, 
  std::string description,
  std::string terms,
  std::string subject
) {
  
    check_auth_or_fail(_capital, coopname, application, "createproj"_n);
  
    project_index projects(_capital, coopname.value);
    auto idx = projects.get_index<"byhash"_n>();
    auto itr = idx.find(project_hash);
    
    check(itr == idx.end(), "Проект с указанным хэшем уже существует");

    projects.emplace(coopname, [&](auto& row) {
      row.id = get_global_id_in_scope(_capital, coopname, "projects"_n); 
      row.project_hash = project_hash;
      row.coopname = coopname;
      row.application = application;
      row.title = title;
      row.description = description;
      row.terms = terms;
      row.subject = subject;
    });   
}