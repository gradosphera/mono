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
      row.status = "opened"_n;
      row.authors_bonus_remain = row.authors_bonus;
      row.creators_amount_remain = row.creators_amount;
      row.creators_bonus_remain = row.creators_bonus;
      row.capitalists_bonus_remain = row.capitalists_bonus;
    });
};
