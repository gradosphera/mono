void capital::setprojevl(name coopname, name application, checksum256 project_hash, uint64_t total_plan_time, asset total_plan_expense, asset norma_hour_cost) {
    // Получаем мастера проекта
    auto project_master = get_project_master(coopname, project_hash);
    eosio::check(project_master.has_value(), "Мастер проекта не найден");
    
    // Проверяем авторизацию мастера
    require_auth(project_master->username);
    
    Wallet::validate_asset(total_plan_expense);
    Wallet::validate_asset(norma_hour_cost);
    
    eosio::check(total_plan_time > 0, "План времени должен быть положительным");
    eosio::check(norma_hour_cost.amount > 0, "Стоимость нормо-часа должна быть положительной");
    
    // Рассчитываем общий план для проекта согласно формулам ТЗ БЛАГОРОСТ v0.1
    eosio::asset creator_base_plan = eosio::asset(
        static_cast<int64_t>(total_plan_time) * norma_hour_cost.amount, 
        norma_hour_cost.symbol
    );
    
    eosio::asset author_base_plan = eosio::asset(
        int64_t(static_cast<double>(creator_base_plan.amount) * 0.618), 
        norma_hour_cost.symbol
    );
    
    // coordinator_base_plan = (creator_base + author_base) / (100% - 4%)
    double total_base = static_cast<double>(creator_base_plan.amount + author_base_plan.amount);
    eosio::asset coordinator_base_plan = eosio::asset(
        int64_t(total_base / (1.0 - COORDINATOR_PERCENT)), 
        norma_hour_cost.symbol
    );
    
    eosio::asset invest_plan = eosio::asset(
        creator_base_plan.amount + coordinator_base_plan.amount + author_base_plan.amount + total_plan_expense.amount,
        norma_hour_cost.symbol
    );
    
    // Обновляем мастера проекта
    master_index masters(_capital, coopname.value);
    auto master_itr = masters.find(project_master->id);
    
    masters.modify(master_itr, project_master->username, [&](auto &m) {
        m.plan_time = total_plan_time;
        m.plan_expense = total_plan_expense;
    });
    
    // Обновляем проект с общей оценкой
    project_index projects(_capital, coopname.value);
    auto project = get_project(coopname, project_hash);
    eosio::check(project.has_value(), "Проект не найден");
    auto project_itr = projects.find(project->id);
    
    projects.modify(project_itr, project_master->username, [&](auto &p) {
        // Обновляем целевые показатели проекта
        p.target = invest_plan;
    });
} 