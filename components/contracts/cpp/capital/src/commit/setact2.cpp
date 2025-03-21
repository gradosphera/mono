void capital::setact2(
    eosio::name coopname,
    eosio::name application,
    eosio::name username,
    checksum256 commit_hash,
    document act
) {
    check_auth_or_fail(_capital, coopname, application, "setact2"_n);
    verify_document_or_fail(act);

    // 1) Ищем коммит
    auto maybe_commit = get_commit(coopname, commit_hash);
    eosio::check(maybe_commit.has_value(), "Коммит не найден");
    auto commit = *maybe_commit;

    eosio::check(commit.username == username, "Неверно указано имя пользователя владельца результата");
    eosio::check(commit.status == "act1"_n,   "Неверный статус для поставки акта");

    // 2) Обновляем сам коммит
    commit_index commits(coopname, coopname.value);
    auto c_itr = commits.find(commit.id);
    eosio::check(c_itr != commits.end(), "commit.id не найден в multi_index commits");
    commits.modify(c_itr, coopname, [&](auto &c) {
        c.status = "act2"_n;
        c.act2   = act;
    });

    // 3) Ищем результат (или кидаем ошибку) и проект
    auto result_obj  = get_result_or_fail(coopname, commit.result_hash, "Результат не найден");
    auto project_obj = get_project(coopname, result_obj.project_hash);
    eosio::check(project_obj.has_value(), "Проект не найден");

    // 4) Ищем вкладчика
    auto exist_contributor = get_active_contributor_or_fail(coopname, result_obj.project_hash, commit.username);
    contributor_index contributors(_capital, coopname.value);
    auto contributor = contributors.find(exist_contributor->id);

    // Распределяем spend на available / for_convert
    double convert_ratio = double(contributor->convert_percent) / HUNDR_PERCENTS;
    asset for_convert(static_cast<int64_t>(commit.spend.amount * convert_ratio), commit.spend.symbol);
    asset available = commit.spend - for_convert;

    // Обновляем поля вкладчика
    contributors.modify(contributor, coopname, [&](auto &c) {
        c.available         += available;
        c.for_convert       += for_convert;
        c.contributed_hours  = commit.contributed_hours;
        c.spend             += commit.spend;
    });

    // 5) Вычисляем bonus
    auto br = capital::calculcate_capital_amounts(commit.spend.amount);

    eosio::asset creators_bonus(br.creators_bonus, commit.spend.symbol);
    eosio::asset authors_bonus(br.authors_bonus,   commit.spend.symbol);
    eosio::asset generated     (br.generated,      commit.spend.symbol);
    eosio::asset participants_bonus(br.participants_bonus, commit.spend.symbol);
    eosio::asset total         (br.total, commit.spend.symbol);

    // 6) Обновляем result
    result_index results(_capital, coopname.value);
    auto result_itr = results.find(result_obj.id);
    eosio::check(result_itr != results.end(), "Результат не найден");

    eosio::check(result_itr->available >= commit.spend, "Недостаточно средств в результате для приёма действия");

    results.modify(result_itr, coopname, [&](auto &row) {
        row.available          -= commit.spend;
        row.spend             += commit.spend;
        row.creators_amount   += commit.spend;
        row.creators_bonus    += creators_bonus;
        row.authors_bonus     += authors_bonus;
        row.generated_amount  += generated;
        row.participants_bonus+= participants_bonus;
        row.participants_bonus_remain += participants_bonus;
        row.total_amount      += total;
        row.commits_count++;

        // CRPS: повышаем cumulative поля
        if (row.authors_shares > 0 && authors_bonus.amount > 0) {
            int64_t delta_auth = (authors_bonus.amount * REWARD_SCALE) / row.authors_shares;
            row.authors_cumulative_reward_per_share += delta_auth;
        }

        if (row.creators_amount.amount > 0 && creators_bonus.amount > 0) {
            int64_t delta_creat = (creators_bonus.amount * REWARD_SCALE) / row.creators_amount.amount;
            row.creators_cumulative_reward_per_share += delta_creat;
        }

        int64_t total_participants_shares = get_capital_program_share_balance(coopname);
        if (total_participants_shares > 0 && participants_bonus.amount > 0) {
            int64_t delta_part = (participants_bonus.amount * REWARD_SCALE) / total_participants_shares;
            row.participants_cumulative_reward_per_share += delta_part;
        }
    });

    // 7) Обновляем проект
    project_index projects(_capital, coopname.value);
    auto proj_itr = projects.find(project_obj->id);
    eosio::check(proj_itr != projects.end(), "Project not found in multi_index");

    projects.modify(proj_itr, _capital, [&](auto &p) {
        p.generated += generated;
    });

    // 8) Обновляем вкладчика и проект (аналог capauthcmmt)
    contributors.modify(contributor, coopname, [&](auto &c){
        c.spend         += commit.spend;
        c.share_balance += commit.spend;
    });

    projects.modify(proj_itr, coopname, [&](auto &p) {
        p.spend                += commit.spend;
        p.available            += commit.spend;
        p.membership_total_shares += commit.spend;
    });

    // 9) Обновляем запись в resactors (создательские доли)
    resactor_index ractors(_capital, coopname.value);
    auto idx = ractors.get_index<"byresuser"_n>();
    auto rkey = combine_checksum_ids(commit.result_hash, commit.username);
    auto ract = idx.find(rkey);

    if (ract == idx.end()) {
        ractors.emplace(coopname, [&](auto &ra){
            ra.id          = ractors.available_primary_key();
            ra.result_hash = commit.result_hash;
            ra.username    = commit.username;
            ra.creators_shares = commit.spend.amount;
        });
    } else {
        auto ract_prim = ractors.find(ract->id);
        ractors.modify(ract_prim, same_payer, [&](auto &ra){
            ra.creators_shares += commit.spend.amount;
        });
    }
    
    std::string memo = "Приём паевого взноса по договору УХД с contributor_id: " + std::to_string(contributor -> id);
  
    // 10) Добавляем заблокированные средства
    Wallet::add_blocked_funds(_capital, coopname, contributor->username, commit.spend, _source_program, memo);

    // 11) Удаляем коммит, если больше не нужен
    commits.erase(c_itr);
}
