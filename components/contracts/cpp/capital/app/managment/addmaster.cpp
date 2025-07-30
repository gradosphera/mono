void capital::addmaster(name coopname, name application, checksum256 project_hash, checksum256 assignment_hash, name master, name role) {
    require_auth(coopname);
    
    // Проверяем что проект существует
    auto project = Capital::get_project(coopname, project_hash);
    eosio::check(project.has_value(), "Проект не найден");
    
    // Проверяем роль
    eosio::check(role == "project"_n || role == "assignment"_n, "Неверная роль мастера");
    
    // Проверяем что пользователь подписал основной договор УХД
    auto contributor = Capital::get_contributor(coopname, master);
    eosio::check(contributor.has_value(), "Мастер должен подписать основной договор УХД");
    eosio::check(contributor -> status == "authorized"_n, "Основной договор УХД не активен");
    
    // Проверяем что пользователь является участником проекта
    eosio::check(Capital::is_contributor_has_appendix_in_project(coopname, project_hash, master), 
                 "Мастер должен быть участником проекта");
    
    // Если роль assignment, проверяем что задание существует
    if (role == "assignment"_n) {
        auto assignment = Capital::get_assignment(coopname, assignment_hash);
        eosio::check(assignment.has_value(), "Задание не найдено");
        
        // Проверяем что мастер ещё не назначен на это задание
        auto existing_master = Capital::get_assignment_master(coopname, assignment_hash);
        eosio::check(!existing_master.has_value(), "Мастер уже назначен на это задание");
    }
    
    // Добавляем мастера
    master_index masters(_capital, coopname.value);
    auto master_id = get_global_id_in_scope(_capital, coopname, "masters"_n);
    
    masters.emplace(coopname, [&](auto &m) {
        m.id = master_id;
        m.project_hash = project_hash;
        m.assignment_hash = assignment_hash;
        m.username = master;
        m.role = role;
        m.status = "active"_n;
        m.plan_time = 0;
        m.plan_expense = asset(0, _root_govern_symbol);
        m.assigned_at = current_time_point();
    });
    
    // Если это мастер задания, обновляем assignment
    if (role == "assignment"_n) {
        Capital::assignment_index assignments(_capital, coopname.value);
        auto assignment = Capital::get_assignment(coopname, assignment_hash);
        auto assignment_itr = assignments.find(assignment->id);
        
        assignments.modify(assignment_itr, coopname, [&](auto &a) {
            a.master = master;
        });
    }
} 