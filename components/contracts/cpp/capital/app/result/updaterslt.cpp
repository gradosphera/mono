void capital::updaterslt(
    eosio::name coopname,
    eosio::name application,
    eosio::name username,
    checksum256 assignment_hash,
    checksum256 result_hash
) {
    require_auth(coopname);

    // Получаем задание (или кидаем ошибку)
    auto exist_assignment = Capital::get_assignment_or_fail(coopname, assignment_hash, "Задание не найдено");
    eosio::check(exist_assignment.status == "closed"_n, "Распределение стоимости задания еще не начато или уже завершено");
    
    // Проверяем, нет ли уже такого клайма
    auto existing_result = Capital::get_result_by_assignment_and_username(coopname, assignment_hash, username);
    eosio::check(!existing_result.has_value(), "Клайм уже существует");

    auto exist_result = Capital::get_result(coopname, result_hash);
    eosio::check(!exist_result.has_value(), "Клайм с указанным хэш уже существует");
    
    // Находим запись в таблице assignments
    Capital::assignment_index assignments(_capital, coopname.value);
    auto assignment = assignments.find(exist_assignment.id);
    
    // Получаем контрибьютора
    auto exist_contributor = Capital::get_active_contributor_or_fail(coopname, exist_assignment.project_hash, username);
    Capital::contributor_index contributors(_capital, coopname.value);
    auto contributor = contributors.find(exist_contributor->id);

    // Попробуем найти creauthor
    auto creauthor = Capital::get_creauthor(coopname, assignment_hash, username);
        
    //=== (A) Авторская часть ===
    eosio::asset author_bonus = asset(0, _root_govern_symbol);
    {
        if (creauthor.has_value()) {
            
            //общее количество авторских премий всех авторов
            uint64_t authors_total       = assignment->authors_bonus.amount;
            
            //количество долей автора в результате
            uint64_t user_auth_shares    = creauthor -> author_shares; 
            
            //количество долей всех авторов в результате
            uint64_t total_auth_shares   = assignment->authors_shares; 

            if (authors_total > 0 && total_auth_shares > 0 && user_auth_shares > 0) {
                
                //считаем долю автора в авторских премиях задания
                uint128_t tmp = (uint128_t)authors_total * (uint128_t)user_auth_shares;
                author_bonus.amount = (uint64_t)(tmp / (uint128_t)total_auth_shares);
                
            }
        }
    }

    //=== (B) Создательская часть ===
    // Себестоимость
    eosio::asset creator_base = asset(0, _root_govern_symbol);
    // Премии
    eosio::asset creator_bonus = asset(0, _root_govern_symbol);
    {
        if (creauthor.has_value()) {
            
            //себестоимость потраченного времени создателем возвращаем как есть
            creator_base.amount = creauthor -> spended.amount;
            
            //сколько премий создателей на распределении в результате
            uint64_t creators_bonus_total        = assignment->creators_bonus.amount;
            
            //количество долей премий создателя в результате
            uint64_t user_creator_bonus_shares     = creauthor -> creator_bonus_shares;
            
            //количество долей премий всех создателей в результате
            uint64_t total_creators_bonus_shares   = assignment->total_creators_bonus_shares; 
            
            if (creators_bonus_total > 0 && total_creators_bonus_shares > 0 && user_creator_bonus_shares > 0) {
                uint128_t tmp = (uint128_t)creators_bonus_total * (uint128_t)user_creator_bonus_shares;
                //считаем премию автора в результате на основе его доли
                creator_bonus.amount = (uint64_t)(tmp / (uint128_t)total_creators_bonus_shares);
            }
        }
    }

    //=== (C) Капиталисты ===
    eosio::asset capitalist_bonus = asset(0, _root_govern_symbol);
    {
        //сумма премий капиталистов на распределении
        uint64_t capitals_total   = assignment->capitalists_bonus.amount;
        
        //количество долей пользователя как капиталиста (участника ЦПП "Капитализация") в премиях капиталистов
        uint64_t user_capital_shares    = Capital::get_capital_user_share_balance(coopname, username);
        
        //общее количество долей капиталистов
        uint64_t total_capital_shares   = Capital::get_capital_program_share_balance(coopname);

        if (capitals_total > 0 && total_capital_shares > 0 && user_capital_shares > 0) {
            uint128_t tmp = (uint128_t)capitals_total * (uint128_t)user_capital_shares;            
            //сумма премий пользователя как капиталиста
            capitalist_bonus.amount = (uint64_t)(tmp / (uint128_t)total_capital_shares);
        }
    }

    //сумма долга пайщика
    eosio::asset debt_amount = asset(0, _root_govern_symbol);
    {
        if (creauthor.has_value()) {
          debt_amount = creauthor -> debt_amount;
        }
    }
    
    //=== Создаём запись в results ===
    Capital::result_index results(_capital, coopname.value);
    uint64_t result_id = get_global_id_in_scope(_capital, coopname, "results"_n);
    
    eosio::check(creator_base >= debt_amount, "Системная ошибка: долгов больше чем себестоимость взносов. Обратитесь в поддержку");
    
    results.emplace(coopname, [&](auto &n) {
        n.id                      = result_id;
        n.username                = username;
        n.assignment_hash         = assignment_hash;
        n.result_hash             = result_hash;
        n.coopname                = coopname;
        n.status                  = "created"_n;
        //сумма себестоимости взноса создателя
        n.creator_base_amount     = creator_base;
        //сумма долга, которая должна быть погашена отдельным заявлением, если она есть
        n.debt_amount             = debt_amount;
        //доступные средства к возврату или конвертации после выплаты долга
        n.available_for_return               = creator_base - debt_amount;        
        //доступные средства к конвертации в "Капитализацию"
        n.available_for_convert              = author_bonus + creator_bonus + capitalist_bonus;
        //разблюдовка по типам премий
        n.creator_bonus_amount    = creator_bonus;
        n.author_bonus_amount     = author_bonus;
        n.capitalist_bonus_amount = capitalist_bonus;// на эту премию пишем отдельное заявление на взнос
        //сумма генераций должна быть внесена отдельным заявлением на взнос, потому - суммируем.
        n.generation_amount       = creator_base + author_bonus + creator_bonus;
        //total_amount - чисто информационный показатель, не используется в расчетах далее
        n.total_amount            = creator_base + author_bonus + creator_bonus + capitalist_bonus;
    });
    
    //проверяем что премий достаточно и ошибок в расчетах нигде нет.                
    eosio::check(assignment -> authors_bonus_remain >= author_bonus, "Недостаточно средств для выплаты премии автора. Вероятно, техническая ошибка. Пожалуйста, обратитесь в поддержку.");
    eosio::check(assignment -> creators_bonus_remain >= creator_bonus, "Недостаточно средств для выплаты премий создателей. Обратитесь в поддержку.");
    eosio::check(assignment -> creators_base_remain >= creator_base, "Недостаточно средств для выплаты себестоимости взносов создателей. Обратитесь в поддержку.");
    eosio::check(assignment -> capitalists_bonus_remain >= capitalist_bonus, "Недостаточно средств для пайщиков");
    
    //=== Уменьшаем остатки в результате ===
    assignments.modify(assignment, coopname, [&](auto &r) {
        if (author_bonus.amount > 0) {
            r.authors_bonus_remain -= author_bonus;
        }
        if (creator_bonus.amount > 0) {
            r.creators_bonus_remain -= creator_bonus;
        }
        if (creator_base.amount > 0) {
            r.creators_base_remain -= creator_base;
        }
        if (capitalist_bonus.amount > 0) {
            r.capitalists_bonus_remain -= capitalist_bonus;
        }

        print("capitalists_bonus_remain: ", r.capitalists_bonus_remain.to_string());
        print("capitalist_bonus: ", capitalist_bonus.to_string());
        print("creators_bonus_remain: ", r.creators_bonus_remain.to_string());
        print("creator_bonus: ", creator_bonus.to_string());
    });
    
}
