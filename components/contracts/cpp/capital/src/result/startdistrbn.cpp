void capital::startdistrbn(name coopname, name application, checksum256 result_hash) {
    check_auth_or_fail(_capital, coopname, application, "start"_n);

    auto result = get_result(coopname, result_hash);
    eosio::check(result.has_value(), "Результат не найден");
    eosio::check(result -> status == "created"_n, "Только результат в статусе created может быть запущен в распределение");
    
    auto project = get_project(coopname, result -> project_hash);
    eosio::check(project.has_value(), "проект не найден");
    
    result_index results(_capital, coopname.value);
    auto result_for_modify = results.find(result -> id);
    
    results.modify(result_for_modify, coopname, [&](auto& row) {
      row.status = "started"_n;
    });
    
    // projects_index projects(_capital, coopname.value);
    // auto project_for_modify = projects.find(project -> id);
    
    // projects.modify(project_for_modify, coopname, [&](auto &p) {
    //   p.available = 
    // });
};
