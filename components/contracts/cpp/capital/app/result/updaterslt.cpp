void capital::updaterslt(
    eosio::name coopname,
    eosio::name application,
    eosio::name username,
    checksum256 project_hash,
    checksum256 result_hash
) {
    require_auth(coopname);

    // Получаем проект (или кидаем ошибку)
    auto exist_project = Capital::Projects::get_project(coopname, project_hash);
    eosio::check(exist_project.has_value(), "Проект не найден");
    
    // Проверяем, нет ли уже такого результата
    auto existing_result = Capital::get_result_by_project_and_username(coopname, project_hash, username);
    eosio::check(!existing_result.has_value(), "Результат уже существует для данного пользователя в проекте");

    auto exist_result = Capital::get_result(coopname, result_hash);
    eosio::check(!exist_result.has_value(), "Результат с указанным хэшем уже существует");
    
    // Получаем контрибьютора
    auto exist_contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, project_hash, username);
    Capital::contributor_index contributors(_capital, coopname.value);
    auto contributor = contributors.find(exist_contributor->id);

    // Получаем генератор для расчетов
    auto segment = Capital::Circle::get_segment(coopname, project_hash, username);
    eosio::check(segment.has_value(), "Генератор не найден для пользователя в данном проекте");
        
    //=== (A) Авторская часть ===
    // Авторская себестоимость
    eosio::asset author_base = asset(0, _root_govern_symbol);
    // Авторские премии
    eosio::asset author_bonus = asset(0, _root_govern_symbol);
    {
        //общее количество авторской себестоимости в проекте
        uint64_t author_base_total = exist_project->fact.authors_base_pool.amount;
        //общее количество авторских премий в проекте
        uint64_t authors_bonus_total = exist_project->fact.authors_bonus_pool.amount;
        
        //количество долей автора в результате
        uint64_t user_auth_shares = segment->author_shares; 
        
        //количество долей всех авторов в проекте
        uint64_t total_auth_shares = exist_project->authors_shares; 

        if (total_auth_shares > 0 && user_auth_shares > 0) {
            if (author_base_total > 0) {
                //считаем долю автора в авторской себестоимости проекта
                uint128_t tmp = (uint128_t)author_base_total * (uint128_t)user_auth_shares;
                author_base.amount = (uint64_t)(tmp / (uint128_t)total_auth_shares);
            }
            
            if (authors_bonus_total > 0) {
                //считаем долю автора в авторских премиях проекта
                uint128_t tmp = (uint128_t)authors_bonus_total * (uint128_t)user_auth_shares;
                author_bonus.amount = (uint64_t)(tmp / (uint128_t)total_auth_shares);
            }
        }
    }

    //=== (B) Создательская часть ===
    // Себестоимость
    eosio::asset creator_base = segment->creator_base;
    // Премии
    eosio::asset creator_bonus = asset(0, _root_govern_symbol);
    {
        //сколько премий создателей на распределении в проекте
        uint64_t creators_bonus_total = exist_project->fact.creators_bonus_pool.amount;
        
        //количество долей премий создателя в проекте
        uint64_t user_creator_bonus_shares = segment->creator_shares;
        
        //количество долей премий всех создателей в проекте
        uint64_t total_creators_bonus_shares = exist_project->fact.creators_base_pool.amount; 
        
        if (creators_bonus_total > 0 && total_creators_bonus_shares > 0 && user_creator_bonus_shares > 0) {
            uint128_t tmp = (uint128_t)creators_bonus_total * (uint128_t)user_creator_bonus_shares;
            //считаем премию создателя в результате на основе его доли
            creator_bonus.amount = (uint64_t)(tmp / (uint128_t)total_creators_bonus_shares);
        }
    }

    //=== (C) Капиталисты ===
    eosio::asset capitalist_bonus = asset(0, _root_govern_symbol);
    {
        //сумма премий капиталистов на распределении в проекте
        uint64_t capitals_total = exist_project->fact.contributors_bonus_pool.amount;
        
        //количество долей пользователя как капиталиста (участника ЦПП "Капитализация") в премиях капиталистов
        uint64_t user_capital_shares = Capital::Core::get_capital_user_share_balance(coopname, username);
        
        //общее количество долей капиталистов
        uint64_t total_capital_shares = Capital::Core::get_capital_program_share_balance(coopname);

        if (capitals_total > 0 && total_capital_shares > 0 && user_capital_shares > 0) {
            uint128_t tmp = (uint128_t)capitals_total * (uint128_t)user_capital_shares;            
            //сумма премий пользователя как капиталиста
            capitalist_bonus.amount = (uint64_t)(tmp / (uint128_t)total_capital_shares);
        }
    }

    //сумма долга пайщика
    eosio::asset debt_amount = segment->debt_amount;
    
    //=== Создаём запись в results ===
    Capital::result_index results(_capital, coopname.value);
    uint64_t result_id = get_global_id_in_scope(_capital, coopname, "results"_n);
    
    eosio::check(creator_base >= debt_amount, "Системная ошибка: долгов больше чем себестоимость взносов. Обратитесь в поддержку");
    
    results.emplace(coopname, [&](auto &n) {
        n.id                      = result_id;
        n.username                = username;
        n.project_hash            = project_hash;
        n.result_hash             = result_hash;
        n.coopname                = coopname;
        n.status                  = "created"_n;
        //сумма себестоимости взноса создателя
        n.creator_base_amount     = creator_base;
        //сумма авторской себестоимости
        n.author_base_amount      = author_base;
        //сумма долга, которая должна быть погашена отдельным заявлением, если она есть
        n.debt_amount             = debt_amount;
        //доступные средства к возврату или конвертации после выплаты долга
        n.available_for_return               = creator_base + author_base - debt_amount;        
        //доступные средства к конвертации в "Капитализацию"
        n.available_for_convert              = author_bonus + creator_bonus + capitalist_bonus;
        //разбивка по типам премий
        n.creator_bonus_amount    = creator_bonus;
        n.author_bonus_amount     = author_bonus;
        n.capitalist_bonus_amount = capitalist_bonus;// на эту премию пишем отдельное заявление на взнос
        //сумма генераций должна быть внесена отдельным заявлением на взнос, потому - суммируем.
        n.generation_amount       = creator_base + author_base + author_bonus + creator_bonus;
        //total_amount - чисто информационный показатель, не используется в расчетах далее
        n.total_amount            = creator_base + author_base + author_bonus + creator_bonus + capitalist_bonus;
    });
    
    //проверяем что премий достаточно и ошибок в расчетах нигде нет.                
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(exist_project->id);
    
    eosio::check(project->fact.authors_base_pool >= author_base, "Недостаточно средств для выплаты авторской себестоимости. Вероятно, техническая ошибка. Пожалуйста, обратитесь в поддержку.");
    eosio::check(project->fact.authors_bonus_pool >= author_bonus, "Недостаточно средств для выплаты премии автора. Вероятно, техническая ошибка. Пожалуйста, обратитесь в поддержку.");
    eosio::check(project->fact.creators_bonus_pool >= creator_bonus, "Недостаточно средств для выплаты премий создателей. Обратитесь в поддержку.");
    eosio::check(project->fact.creators_base_pool >= creator_base, "Недостаточно средств для выплаты себестоимости взносов создателей. Обратитесь в поддержку.");
    eosio::check(project->fact.contributors_bonus_pool >= capitalist_bonus, "Недостаточно средств для пайщиков");
    
    //=== Уменьшаем остатки в проекте ===
    projects.modify(project, coopname, [&](auto &p) {
        if (author_base.amount > 0) {
            p.fact.authors_base_pool -= author_base;
        }
        if (author_bonus.amount > 0) {
            p.fact.authors_bonus_pool -= author_bonus;
        }
        if (creator_bonus.amount > 0) {
            p.fact.creators_bonus_pool -= creator_bonus;
        }
        if (creator_base.amount > 0) {
            p.fact.creators_base_pool -= creator_base;
        }
        if (capitalist_bonus.amount > 0) {
            p.fact.contributors_bonus_pool -= capitalist_bonus;
        }

        print("contributors_bonus_pool remain: ", p.fact.contributors_bonus_pool.to_string());
        print("capitalist_bonus: ", capitalist_bonus.to_string());
        print("creators_bonus_pool remain: ", p.fact.creators_bonus_pool.to_string());
        print("creator_bonus: ", creator_bonus.to_string());
    });
    
}
