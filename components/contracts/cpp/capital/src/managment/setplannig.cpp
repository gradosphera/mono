void capital::setplannig(name coopname, name application, checksum256 assignment_hash, uint64_t plan_time, asset plan_expense, asset norma_hour_cost) {
    // Получаем мастера задания 
    auto master = get_assignment_master_or_fail(coopname, assignment_hash, "Мастер задания не найден");
    
    // Проверяем авторизацию мастера
    require_auth(master.username);
    
    Wallet::validate_asset(plan_expense);
    Wallet::validate_asset(norma_hour_cost);
    
    eosio::check(plan_time > 0, "План времени должен быть положительным");
    eosio::check(norma_hour_cost.amount > 0, "Стоимость нормо-часа должна быть положительной");
    
    // Рассчитываем план согласно формулам ТЗ
    eosio::asset creator_base_plan = eosio::asset(
        static_cast<int64_t>(plan_time) * norma_hour_cost.amount, 
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
        creator_base_plan.amount + coordinator_base_plan.amount + author_base_plan.amount + plan_expense.amount,
        norma_hour_cost.symbol
    );
    
    // Обновляем мастера
    master_index masters(_capital, coopname.value);
    auto master_itr = masters.find(master.id);
    
    masters.modify(master_itr, master.username, [&](auto &m) {
        m.plan_time = plan_time;
        m.plan_expense = plan_expense;
    });
    
    // Обновляем задание
    assignment_index assignments(_capital, coopname.value);
    auto assignment = get_assignment_or_fail(coopname, assignment_hash, "Задание не найдено");
    auto assignment_itr = assignments.find(assignment.id);
    
    assignments.modify(assignment_itr, master.username, [&](auto &a) {
        a.plan_time = plan_time;
        a.plan_expense = plan_expense;
        a.creator_base_plan = creator_base_plan;
        a.author_base_plan = author_base_plan;
        a.coordinator_base_plan = coordinator_base_plan;
        a.invest_plan = invest_plan;
    });
} 