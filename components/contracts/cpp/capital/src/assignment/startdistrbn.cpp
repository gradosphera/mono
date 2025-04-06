void capital::startdistrbn(name coopname, name application, checksum256 assignment_hash) {
    check_auth_or_fail(_capital, coopname, application, "start"_n);

    auto assignment = get_assignment(coopname, assignment_hash);
    eosio::check(assignment.has_value(), "Задание не найдено");
    eosio::check(assignment -> status == "opened"_n, "Только задание в статусе opened может быть запущен в распределение");
    
    auto project = get_project(coopname, assignment -> project_hash);
    eosio::check(project.has_value(), "проект не найден");
    
    assignment_index assignments(_capital, coopname.value);
    auto assignment_for_modify = assignments.find(assignment -> id);
    
    assignments.modify(assignment_for_modify, coopname, [&](auto& row) {
      row.status = "closed"_n;
      row.authors_bonus_remain = row.authors_bonus;
      row.creators_base_remain = row.creators_base;
      row.creators_bonus_remain = row.creators_bonus;
      row.capitalists_bonus_remain = row.capitalists_bonus;
    });
};
