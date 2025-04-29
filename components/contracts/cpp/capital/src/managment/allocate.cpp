void capital::allocate(eosio::name coopname, eosio::name application, checksum256 project_hash, checksum256 assignment_hash, eosio::asset amount) {
  check_auth_or_fail(_capital, coopname, application, "allocate"_n);

  Wallet::validate_asset(amount);
  
  auto project = get_project(coopname, project_hash);
  eosio::check(project.has_value(), "Проект с указанным хэшем не найден");
    
  auto assignment = get_assignment(coopname, assignment_hash);
  eosio::check(assignment.has_value(), "Объект задананиеа не найден");
  eosio::check(project -> available >= amount, "Недостаточно средств в проекте для аллокации в задание");
        
  project_index projects(_capital, coopname.value);
  auto project_for_modify = projects.find(project -> id);
  
  projects.modify(project_for_modify, coopname, [&](auto& row) {
    row.available -= amount;
    row.allocated += amount;
  });
  
  assignment_index assignments(_capital, coopname.value);
  auto assignment_for_modify = assignments.find(assignment -> id);
  
  assignments.modify(assignment_for_modify, coopname, [&](auto& row) {
    row.allocated += amount;
    row.available += amount;
  });
};