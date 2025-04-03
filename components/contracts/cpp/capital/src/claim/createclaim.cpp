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
    eosio::check(exist_result.status == "opened"_n, "Распределение стоимости результата еще не начато или уже завершено");
    
    // Проверяем, нет ли уже такого клайма
    auto existing_claim = get_claim_by_result_and_username(coopname, result_hash, username);
    eosio::check(!existing_claim.has_value(), "Клайм уже существует");

    auto exist_claim = get_claim(coopname, claim_hash);
    eosio::check(exist_claim.has_value(), "Клайм с указанным хэш уже существует");
    
    // Находим запись в таблице results
    result_index results(_capital, coopname.value);
    auto result = results.find(exist_result.id);
    
    // Получаем контрибьютора
    auto exist_contributor = get_active_contributor_or_fail(coopname, exist_result.project_hash, username);
    contributor_index contributors(_capital, coopname.value);
    auto contributor = contributors.find(exist_contributor->id);

    // Попробуем найти resactor
    auto optional_resactor = get_resactor(coopname, result_hash, username);
        
    //=== (A) Авторская часть ===
    uint64_t author_amount = 0;
    {
        
        // Если resactor есть, считаем долю.
        if (optional_resactor.has_value()) {
            auto resactor = *optional_resactor;

            // Исходная сумма (просто authors_bonus.amount)
            uint64_t authors_total = result -> authors_bonus.amount;
            // Доля пользователя
            uint64_t user_auth_shares = resactor.authors_shares; 
            // Всего долей авторов
            uint64_t total_auth_shares = result -> authors_shares; 

            if (authors_total > 0 && total_auth_shares > 0 && user_auth_shares > 0) {
                uint128_t tmp = (uint128_t)authors_total * (uint128_t)user_auth_shares;
                author_amount  = (uint64_t)(tmp / (uint128_t)total_auth_shares);
                print(result->authors_bonus_remain.amount, ", ", author_amount);
                
                eosio::check(result->authors_bonus_remain.amount >= author_amount,
                            "Недостаточно средств для авторов");
            }
        }
    }

    //=== (B) Создательская часть бонусов ===
    uint64_t creator_amount = 0;
    {
        if (optional_resactor.has_value()) {
            auto resactor = *optional_resactor;

            uint64_t creators_bonus_total    = result->creators_bonus.amount; // вся сумма создателей
            uint64_t user_creator_bonus_shares = resactor.creators_bonus_shares;
            uint64_t total_creators_bonus_shares= result->total_creators_bonus_shares; 

            if (creators_bonus_total > 0 && total_creators_bonus_shares > 0 && user_creator_bonus_shares > 0) {
                uint128_t tmp = (uint128_t)creators_bonus_total * (uint128_t)user_creator_bonus_shares;
                creator_amount = (uint64_t)(tmp / (uint128_t)total_creators_bonus_shares);

                eosio::check(result->creators_bonus_remain.amount >= creator_amount, "Недостаточно средств для создателей");
            }
        }
    }

    //=== (C) Капиталисты ===
    // здесь resactor НЕ обязателен, доли берём из глобальных методов
    uint64_t capitalist_amount = 0;
    {
        // Полная сумма для капиталистов
        uint64_t capitals_total = result->capitalists_bonus.amount;

        // Пользовательские доли берем из кошелька программы
        uint64_t user_cap_shares  = get_capital_user_share_balance(coopname, username);
        // Общее число долей капиталистов во всей программе
        uint64_t total_cap_shares = get_capital_program_share_balance(coopname);

        if (capitals_total > 0 && total_cap_shares > 0 && user_cap_shares > 0) {
            uint128_t tmp = (uint128_t)capitals_total * (uint128_t)user_cap_shares;
            capitalist_amount = (uint64_t)(tmp / (uint128_t)total_cap_shares);

            eosio::check(result->capitalists_bonus_remain.amount >= capitalist_amount,
                        "Недостаточно средств для пайщиков");
        }
    }

    //=== Складываем всё ===
    uint64_t total_claim_amount = author_amount + creator_amount + capitalist_amount;
    eosio::asset total_amount(total_claim_amount, _root_govern_symbol);

    //=== Создаём запись в claims ===
    claim_index claims(_capital, coopname.value);
    uint64_t claim_id = get_global_id_in_scope(_capital, coopname, "claims"_n);
    
    claims.emplace(coopname, [&](auto &n) {
        n.id          = claim_id;
        n.username    = username;
        n.result_hash = result_hash;
        n.claim_hash  = claim_hash;
        n.coopname    = coopname;
        n.status      = "created"_n;
        n.author_amount = asset(author_amount, _root_govern_symbol);
        n.creator_amount = asset(creator_amount, _root_govern_symbol);
        n.capitalist_amount = asset(capitalist_amount, _root_govern_symbol);
        n.total_amount      = total_amount;
    });

    //=== Уменьшаем остаток bonus_remain ===
    results.modify(result, coopname, [&](auto &r){
        // авторы
        if (author_amount > 0) {
            r.authors_bonus_remain -= eosio::asset(author_amount, _root_govern_symbol);
        }
        // создатели
        if (creator_amount > 0) {
            r.creators_bonus_remain -= eosio::asset(creator_amount, _root_govern_symbol);
        }
        // капиталисты
        if (capitalist_amount > 0) {
            r.capitalists_bonus_remain -= eosio::asset(capitalist_amount, _root_govern_symbol);
        }
    });
}
