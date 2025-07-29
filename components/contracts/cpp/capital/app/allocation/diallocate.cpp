void capital::diallocate(eosio::name coopname, eosio::name application, checksum256 project_hash, checksum256 assignment_hash, eosio::asset amount) {
  check_auth_or_fail(_capital, coopname, application, "diallocate"_n);

  Wallet::validate_asset(amount);
  
  auto project = Capital::get_project(coopname, project_hash);
  eosio::check(project.has_value(), "Проект с указанным хэшем не найден");

  auto assignment = Capital::get_assignment(coopname, assignment_hash);
  eosio::check(assignment.has_value(), "Объект задананиеа не найден");
  eosio::check(assignment -> available >= amount, "Недостаточно средств в задананиее для возврата в проект");

  Capital::assignment_index assignments(_capital, coopname.value);
  auto assignment_for_modify = assignments.find(assignment -> id);

  assignments.modify(assignment_for_modify, coopname, [&](auto& row) {
    row.available -= amount;
    row.allocated -= amount;
  });

  Capital::project_index projects(_capital, coopname.value);
  auto project_for_modify = projects.find(project -> id);

  projects.modify(project_for_modify, coopname, [&](auto& row) {
    row.available += amount;
    row.allocated -= amount;
  });
};
