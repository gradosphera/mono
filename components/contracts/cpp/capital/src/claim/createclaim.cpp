void capital::createclaim(
    eosio::name coopname,
    eosio::name application,
    eosio::name username,
    checksum256 result_hash,
    checksum256 claim_hash
) {
    require_auth(coopname);

    // Получаем результат (или кидаем ошибку)
    auto exist_result = get_result_or_fail(coopname, result_hash, "Результат не найден");
    eosio::check(exist_result.status == "closed"_n, "Распределение стоимости результата еще не начато или уже завершено");
    
    // Проверяем, нет ли уже такого клайма
    auto existing_claim = get_claim_by_result_and_username(coopname, result_hash, username);
    eosio::check(!existing_claim.has_value(), "Клайм уже существует");

    auto exist_claim = get_claim(coopname, claim_hash);
    eosio::check(!exist_claim.has_value(), "Клайм с указанным хэш уже существует");
    
    // Находим запись в таблице results
    result_index results(_capital, coopname.value);
    auto result = results.find(exist_result.id);
    
    // Получаем контрибьютора
    auto exist_contributor = get_active_contributor_or_fail(coopname, exist_result.project_hash, username);
    contributor_index contributors(_capital, coopname.value);
    auto contributor = contributors.find(exist_contributor->id);

    // Попробуем найти resactor
    auto resactor = get_resactor(coopname, result_hash, username);
        
    //=== (A) Авторская часть ===
    eosio::asset author_bonus = asset(0, _root_govern_symbol);
    {
        if (resactor.has_value()) {
            
            //общее количество авторских премий всех авторов
            uint64_t authors_total       = result->authors_bonus.amount;
            
            //количество долей автора в результате
            uint64_t user_auth_shares    = resactor -> author_shares; 
            
            //количество долей всех авторов в результате
            uint64_t total_auth_shares   = result->authors_shares; 

            if (authors_total > 0 && total_auth_shares > 0 && user_auth_shares > 0) {
                
                //считаем долю автора в авторских премиях результата
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
        if (resactor.has_value()) {
            
            //себестоимость потраченного времени создателем возвращаем как есть
            creator_base.amount = resactor -> spended.amount;
            
            //сколько премий создателей на распределении в результате
            uint64_t creators_bonus_total        = result->creators_bonus.amount;
            
            //количество долей премий создателя в результате
            uint64_t user_creator_bonus_shares     = resactor -> creator_bonus_shares;
            
            //количество долей премий всех создателей в результате
            uint64_t total_creators_bonus_shares   = result->total_creators_bonus_shares; 
            
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
        uint64_t capitals_total   = result->capitalists_bonus.amount;
        
        //количество долей пользователя как капиталиста (участника ЦПП "Капитализация") в премиях капиталистов
        uint64_t user_capital_shares    = get_capital_user_share_balance(coopname, username);
        
        //общее количество долей капиталистов
        uint64_t total_capital_shares   = get_capital_program_share_balance(coopname);

        if (capitals_total > 0 && total_capital_shares > 0 && user_capital_shares > 0) {
            uint128_t tmp = (uint128_t)capitals_total * (uint128_t)user_capital_shares;            
            //сумма премий пользователя как капиталиста
            capitalist_bonus.amount = (uint64_t)(tmp / (uint128_t)total_capital_shares);
        }
    }

    //сумма долга пайщика
    eosio::asset debt_amount = asset(0, _root_govern_symbol);
    {
        if (resactor.has_value()) {
          debt_amount = resactor -> debt_amount;
        }
    }
    
    //=== Создаём запись в claims ===
    claim_index claims(_capital, coopname.value);
    uint64_t claim_id = get_global_id_in_scope(_capital, coopname, "claims"_n);
    
    eosio::check(creator_base >= debt_amount, "Системная ошибка: долгов больше чем себестоимость взносов. Обратитесь в поддержку");
    
    claims.emplace(coopname, [&](auto &n) {
        n.id                      = claim_id;
        n.username                = username;
        n.result_hash             = result_hash;
        n.claim_hash              = claim_hash;
        n.coopname                = coopname;
        n.status                  = "created"_n;
        //сумма себестоимости взноса создателя
        n.creator_base_amount     = creator_base;
        //сумма долга, которая должна быть погашена отдельным заявлением, если она есть
        n.debt_amount             = debt_amount;
        //доступные средства к возврату или конвертации после выплаты долга
        n.available               = creator_base - debt_amount;
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
    eosio::check(result -> authors_bonus_remain >= author_bonus, "Недостаточно средств для выплаты премии автора. Вероятно, техническая ошибка. Пожалуйста, обратитесь в поддержку.");
    eosio::check(result -> creators_bonus_remain >= creator_bonus, "Недостаточно средств для выплаты премий создателей. Обратитесь в поддержку.");
    eosio::check(result -> creators_base_remain >= creator_base, "Недостаточно средств для выплаты себестоимости взносов создателей. Обратитесь в поддержку.");
    eosio::check(result -> capitalists_bonus_remain >= capitalist_bonus, "Недостаточно средств для пайщиков");
    
    //=== Уменьшаем остатки в результате ===
    results.modify(result, coopname, [&](auto &r) {
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
