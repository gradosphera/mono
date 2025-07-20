void capital::startdistrbn(name coopname, name application, checksum256 assignment_hash) {
    check_auth_or_fail(_capital, coopname, application, "start"_n);

    auto assignment = get_assignment(coopname, assignment_hash);
    eosio::check(assignment.has_value(), "Задание не найдено");
    eosio::check(assignment -> status == "opened"_n, "Только задание в статусе opened может быть запущен в распределение");
    
    auto project = get_project(coopname, assignment -> project_hash);
    eosio::check(project.has_value(), "проект не найден");
    
    assignment_index assignments(_capital, coopname.value);
    auto assignment_for_modify = assignments.find(assignment -> id);
    
    // Рассчитываем общую сумму долгов для задания
    eosio::asset sum_debt_amount = asset(0, _root_govern_symbol);
    
    // Суммируем все долги по этому заданию
    creauthor_index creauthors(_capital, coopname.value);
    auto assignment_idx = creauthors.get_index<"byassignment"_n>();
    auto lower = assignment_idx.lower_bound(assignment_hash);
    auto upper = assignment_idx.upper_bound(assignment_hash);
    
    for (auto itr = lower; itr != upper; ++itr) {
        if (itr->assignment_hash == assignment_hash) {
            sum_debt_amount += itr->debt_amount;
        }
    }
    
    // Рассчитываем правильную капитализацию согласно ТЗ БЛАГОРОСТ v0.1
    // contributors_bonus = (generated - sum_debt_amount) * 1.618
    eosio::asset correct_capitalists_bonus = calculate_capitalists_bonus_with_debts(
        assignment->generated, 
        sum_debt_amount
    );
    
    //заносим доступные средства к распределению с правильной капитализацией
    assignments.modify(assignment_for_modify, coopname, [&](auto& row) {
      row.status = "closed"_n;
      row.authors_bonus_remain = row.authors_bonus;
      row.creators_base_remain = row.creators_base;
      row.creators_bonus_remain = row.creators_bonus;
      // Используем правильно рассчитанную капитализацию
      row.capitalists_bonus = correct_capitalists_bonus;
      row.capitalists_bonus_remain = correct_capitalists_bonus;
      // Обновляем общую стоимость с учётом правильной капитализации
      row.total = row.generated + correct_capitalists_bonus;
    });
    
    // Обновляем проект с правильной капитализацией
    project_index projects(_capital, coopname.value);
    auto project_itr = projects.find(project->id);
    
    projects.modify(project_itr, coopname, [&](auto& p) {
        // Просто устанавливаем правильную капитализацию без вычитания старых данных
        p.capitalists_bonus = correct_capitalists_bonus;
        p.total = p.generated + correct_capitalists_bonus;
    });
};
