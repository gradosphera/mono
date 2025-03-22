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
    auto exist_commit = get_commit(coopname, commit_hash);
    eosio::check(exist_commit.has_value(), "Коммит не найден");
    
    eosio::check(exist_commit -> username == username, "Неверно указано имя пользователя владельца результата");
    eosio::check(exist_commit -> status == "act1"_n,   "Неверный статус для поставки акта");

    // 2) Обновляем сам коммит
    commit_index commits(_capital, coopname.value);
    auto commit = commits.find(exist_commit -> id);
    
    commits.modify(commit, coopname, [&](auto &c) {
        c.status = "act2"_n;
        c.act2   = act;
    });

    // 3) Ищем результат (или кидаем ошибку) и проект
    auto exist_result  = get_result_or_fail(coopname, commit->result_hash, "Результат не найден");
    
    auto exist_project = get_project(coopname, exist_result.project_hash);
    eosio::check(exist_project.has_value(), "Проект не найден");

    // 4) Ищем вкладчика
    auto exist_contributor = get_active_contributor_or_fail(coopname, exist_result.project_hash, commit->username);
    contributor_index contributors(_capital, coopname.value);
    auto contributor = contributors.find(exist_contributor->id);

    // Распределяем spend на available / for_convert
    double convert_ratio = double(contributor->convert_percent) / HUNDR_PERCENTS;
    asset for_convert(static_cast<int64_t>(commit->spend.amount * convert_ratio), commit->spend.symbol);
    asset available = commit->spend - for_convert;

    // Обновляем поля вкладчика
    contributors.modify(contributor, coopname, [&](auto &c) {
        c.available         += available;
        c.for_convert       += for_convert;
        c.contributed_hours  = commit->contributed_hours;
        c.spend             += commit->spend;
    });

    // 5) Вычисляем bonus
    auto br = capital::calculcate_capital_amounts(commit->spend.amount);

    eosio::asset creators_bonus(br.creators_bonus, commit->spend.symbol);
    eosio::asset authors_bonus(br.authors_bonus,   commit->spend.symbol);
    eosio::asset generated     (br.generated,      commit->spend.symbol);
    eosio::asset participants_bonus(br.participants_bonus, commit->spend.symbol);
    eosio::asset total         (br.total, commit->spend.symbol);

    // 6) Обновляем result
    result_index results(_capital, coopname.value);
    auto result = results.find(exist_result.id);
    
    eosio::check(result -> available >= commit->spend, "Недостаточно средств в результате для приёма действия");

    results.modify(result, coopname, [&](auto &row) {
        row.available         -= commit->spend;
        row.spend             += commit->spend;
        row.creators_amount   += commit->spend;
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
    auto project = projects.find(exist_project->id);
    
    // 8) Обновляем вкладчика и проект (аналог capauthcmmt)
    contributors.modify(contributor, coopname, [&](auto &c){
        c.spend         += commit->spend;
        c.share_balance += commit->spend;
    });

    projects.modify(project, coopname, [&](auto &p) {
        p.generated            += generated;
        p.spend                += commit->spend;
        p.available            += commit->spend;
        p.membership_total_shares += commit->spend;
    });

    // 9) Обновляем запись в resactors (создательские доли)
    auto exist_resactor = get_resactor(coopname, commit->result_hash, commit->username);
    resactor_index ractors(_capital, coopname.value);
      
    if (!exist_resactor.has_value()) {
      ractors.emplace(coopname, [&](auto &ra){
          ra.id          = ractors.available_primary_key();
          ra.result_hash = commit->result_hash;
          ra.username    = commit->username;
          ra.creators_shares = commit->spend.amount;
      });
    } else {
      auto resactor = ractors.find(exist_resactor -> id);
      ractors.modify(resactor, coopname, [&](auto &ra){
          ra.creators_shares += commit->spend.amount;
      });
    }
    
    std::string memo = "Приём паевого взноса по договору УХД с contributor_id: " + std::to_string(contributor -> id);
  
    // 10) Добавляем заблокированные средства
    Wallet::add_blocked_funds(_capital, coopname, contributor->username, commit->spend, _source_program, memo);

}
