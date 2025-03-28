/**
 * @brief Принятие второго акта (act2). Убираем любой CRPS, просто плюсуем бонусы.
 */
void capital::setact2(
    eosio::name coopname,
    eosio::name application,
    eosio::name username,
    checksum256 commit_hash,
    document act
) {
    check_auth_or_fail(_capital, coopname, application, "setact2"_n);
    verify_document_or_fail(act);

    // Ищем коммит
    auto exist_commit = get_commit(coopname, commit_hash);
    eosio::check(exist_commit.has_value(), "Коммит не найден");
    
    eosio::check(exist_commit -> username == username, "Неверно указано имя пользователя владельца результата");
    eosio::check(exist_commit -> status == "act1"_n,   "Неверный статус для поставки акта");

    // Обновляем коммит
    // commit_index commits(_capital, coopname.value);
    // auto commit = commits.find(exist_commit->id);
    // commits.modify(commit, coopname, [&](auto &c) {
    //     c.status = "act2"_n;
    //     c.act2   = act;
    // });

    // // Ищем результат и проект
    // auto exist_result  = get_result_or_fail(coopname, commit->result_hash, "Результат не найден");
    // auto exist_project = get_project(coopname, exist_result.project_hash);
    // eosio::check(exist_project.has_value(), "Проект не найден");

    // // Ищем вкладчика
    // auto exist_contributor = get_active_contributor_or_fail(coopname, exist_result.project_hash, commit->username);
    // contributor_index contributors(_capital, coopname.value);
    // auto contributor = contributors.find(exist_contributor->id);

    // // Распределяем spended на available / for_convert
    // // convert_percent — целое число от 0 до HUNDR_PERCENTS
    // int64_t for_convert_amount = (commit->spended.amount * contributor->convert_percent) / HUNDR_PERCENTS;
    // eosio::asset for_convert(for_convert_amount, commit->spended.symbol);
    // eosio::asset available = commit->spended - for_convert;
    
    // // Вычисляем bonus
    // auto br = capital::calculcate_capital_amounts(commit->spended.amount);

    // eosio::asset creators_bonus     (br.creators_bonus,    commit->spended.symbol);
    // eosio::asset authors_bonus      (br.authors_bonus,     commit->spended.symbol);
    // eosio::asset generated          (br.generated,         commit->spended.symbol);
    // eosio::asset capitalists_bonus  (br.capitalists_bonus, commit->spended.symbol);
    // eosio::asset total              (br.total,             commit->spended.symbol);

    // // Обновляем result
    // result_index results(_capital, coopname.value);
    // auto result = results.find(exist_result.id);
    // eosio::check(result->available >= commit->spended, "Недостаточно средств в результате для приёма коммита");

    // results.modify(result, coopname, [&](auto &row) {
    //     row.available          -= commit->spended;
    //     row.spended              += commit->spended;
    //     row.creators_amount    += commit->spended; 
    //     row.total_creators_bonus_shares    += commit->spended.amount; 
    //     row.creators_bonus     += creators_bonus;
    //     row.authors_bonus      += authors_bonus;
    //     row.generated_amount   += generated;
    //     row.capitalists_bonus  += capitalists_bonus;
    //     row.total_amount       += total;
    //     row.commits_count++;
    // });

    // // Обновляем проект
    // project_index projects(_capital, coopname.value);
    // auto project = projects.find(exist_project->id);

    // projects.modify(project, coopname, [&](auto &p) {
    //     p.generated             += generated;
    //     p.spended                 += commit->spended;
    //     p.total_share_balance += commit->spended; 
    // });
    
    // // Обновляем актора и проект
    // contributors.modify(contributor, coopname, [&](auto &c){
    //     c.spended         += commit->spended;
    //     c.share_balance += commit->spended;
    //     c.contributed_hours  += commit->contributed_hours;
    // });

    // // Обновляем запись в resactors (создательские доли)
    // auto exist_resactor = get_resactor(coopname, commit->result_hash, commit->username);
    // resactor_index ractors(_capital, coopname.value);
      
    // if (!exist_resactor.has_value()) {
      
    //   ractors.emplace(coopname, [&](auto &ra){
    //       ra.id            = ractors.available_primary_key();
    //       ra.project_hash  = commit->project_hash;
    //       ra.result_hash   = commit->result_hash;
    //       ra.username      = commit->username;
    //       ra.creators_bonus_shares = commit->spended.amount;
    //       ra.spended = commit->spended;
    //       ra.for_convert = for_convert;
    //       ra.available = available;
    //       ra.contributed_hours  = commit->contributed_hours;
    //   });
      
    // } else {
      
    //   auto resactor = ractors.find(exist_resactor->id);
    //   ractors.modify(resactor, coopname, [&](auto &ra) {
    //       ra.creators_bonus_shares += commit -> spended.amount; 
    //       ra.for_convert += for_convert;
    //       ra.available += available;
    //       ra.spended += commit->spended;
    //       ra.contributed_hours  += commit->contributed_hours;
    //   });
      
    // }
    
    // // 10) Добавляем заблокированные средства на договор УХД
    // std::string memo = "Приём паевого взноса по договору УХД с contributor_id: " + std::to_string(contributor->id);
    // Wallet::add_blocked_funds(_capital, coopname, contributor->username, commit->spended, _source_program, memo);
}
