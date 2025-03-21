void capital::updatecapitl(
    eosio::name coopname,
    eosio::name application,
    eosio::name username,
    checksum256 result_hash,
    checksum256 claim_hash
) {
    // Авторизация
    check_auth_or_fail(_capital, coopname, application, "updatecapitl"_n);

    // Проверяем программу и кошелёк
    auto capital_program = get_capital_program_or_fail(coopname);
    auto capital_wallet  = get_capital_wallet(coopname, username);
    eosio::check(!capital_wallet.has_value(), "Нет соглашения целевой программы!");

    // Проверяем, нет ли уже такого клайма
    auto existing_claim = get_claim(coopname, claim_hash);
    eosio::check(!existing_claim.has_value(), "Клайм уже существует");

    // Получаем результат (или кидаем ошибку)
    auto res_obj = get_result_or_fail(coopname, result_hash, "Результат не найден");
    
    // Получаем запись resactor ИЛИ кидаем ошибку
    auto user_resactor = get_resactor_or_fail(
        coopname,
        result_hash,
        username,
        "Пользователь не имеет долей (resactor) в данном результате, сначала зарегистрируйтесь"
    );

    // Находим запись в таблице results, чтобы получить CRPS и participants_bonus_remain
    result_index results(_capital, coopname.value);
    auto res_itr = results.find(res_obj.id);
    eosio::check(res_itr != results.end(), "Результат не найден в multi_index results");

    // 1) Считаем начисление по трём категориям
    uint64_t author_amount       = 0;
    uint64_t creator_bonus_amount= 0;
    uint64_t participant_amount  = 0;

    // Авторы
    if (user_resactor.authors_shares > 0) {
        int64_t current_crps_auth = res_itr->authors_cumulative_reward_per_share;
        int64_t last_crps_auth    = user_resactor.reward_per_share_last_authors;
        int64_t delta_auth        = current_crps_auth - last_crps_auth;
        if (delta_auth > 0) {
            author_amount = static_cast<uint64_t>(
                (static_cast<uint128_t>(user_resactor.authors_shares) *
                 static_cast<uint128_t>(delta_auth)) / REWARD_SCALE
            );
        }
    }

    // Создатели
    if (user_resactor.creators_shares > 0) {
        int64_t current_crps_creat = res_itr->creators_cumulative_reward_per_share;
        int64_t last_crps_creat    = user_resactor.reward_per_share_last_creators;
        int64_t delta_creat        = current_crps_creat - last_crps_creat;
        if (delta_creat > 0) {
            creator_bonus_amount = static_cast<uint64_t>(
                (static_cast<uint128_t>(user_resactor.creators_shares) *
                 static_cast<uint128_t>(delta_creat)) / REWARD_SCALE
            );
        }
    }

    // Пайщики
    if (user_resactor.participants_shares > 0) {
        int64_t current_crps_parts = res_itr->participants_cumulative_reward_per_share;
        int64_t last_crps_parts    = user_resactor.reward_per_share_last_participants;
        int64_t delta_parts        = current_crps_parts - last_crps_parts;
        if (delta_parts > 0) {
            participant_amount = static_cast<uint64_t>(
                (static_cast<uint128_t>(user_resactor.participants_shares) *
                 static_cast<uint128_t>(delta_parts)) / REWARD_SCALE
            );
        }
    }

    // 2) Складываем всё
    uint64_t total_claim_amount = author_amount + creator_bonus_amount + participant_amount;
    eosio::asset amount(total_claim_amount, _root_govern_symbol);

    // 3) Создаём запись в таблице claims
    claim_index claims(_capital, coopname.value);
    uint64_t claim_id = get_global_id_in_scope(_capital, coopname, "claims"_n);
    claims.emplace(coopname, [&](auto &n) {
        n.id         = claim_id;
        n.claim_hash = claim_hash;
        n.username   = username;
        n.result_hash= result_hash;
        n.coopname   = coopname;
        n.status     = "created"_n;
        n.amount     = amount;
    });

    // 4) Уменьшаем participants_bonus_remain (если надо)
    eosio::check(res_itr->participants_bonus_remain.amount >= participant_amount, "Недостаточно средств для пайщиков");
    results.modify(res_itr, coopname, [&](auto &r){
        r.participants_bonus_remain -= eosio::asset(participant_amount, _root_govern_symbol);
    });

    // 5) Обновляем reward_per_share_last_* в resactor
    auto exist_resactor = get_resactor_or_fail(coopname, result_hash, username, "Объект пайщика в результате не найден");
    
    resactor_index ractors(_capital, coopname.value);
    auto ract_it = ractors.find(exist_resactor.id);

    ractors.modify(ract_it, same_payer, [&](auto &ra){
        // Если действительно происходил прирост (delta>0), обновляем
        if (ra.authors_shares > 0) {
            int64_t current_crps_auth = res_itr->authors_cumulative_reward_per_share;
            int64_t delta_auth = current_crps_auth - ra.reward_per_share_last_authors;
            if (delta_auth > 0) {
                ra.reward_per_share_last_authors = current_crps_auth;
            }
        }
        if (ra.creators_shares > 0) {
            int64_t current_crps_creat = res_itr->creators_cumulative_reward_per_share;
            int64_t delta_creat = current_crps_creat - ra.reward_per_share_last_creators;
            if (delta_creat > 0) {
                ra.reward_per_share_last_creators = current_crps_creat;
            }
        }
        if (ra.participants_shares > 0) {
            int64_t current_crps_parts = res_itr->participants_cumulative_reward_per_share;
            int64_t delta_parts = current_crps_parts - ra.reward_per_share_last_participants;
            if (delta_parts > 0) {
                ra.reward_per_share_last_participants = current_crps_parts;
            }
        }
    });
}
