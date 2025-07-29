[[eosio::action]] void capital::refreshproj(name coopname, name application, checksum256 project_hash, name username) {
    check_auth_or_fail(_capital, coopname, application, "contribute"_n);

    // 1. Получаем проект
    auto exist_project = Capital::get_project(coopname, project_hash);
    eosio::check(exist_project.has_value(), "Проект не найден");

    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(exist_project->id);

    // 2. Находим пайщика в проекте
    auto exist = Capital::get_active_contributor_or_fail(coopname, project_hash, username);
    
    Capital::contributor_index contributors(_capital, coopname.value);
    auto contributor = contributors.find(exist->id);

    // 3. Считаем дельту CRPS
    int64_t current_crps = project -> membership_cumulative_reward_per_share;
    int64_t last_crps    = contributor -> reward_per_share_last;
    int64_t delta        = current_crps - last_crps;

    int64_t share_balance = contributor -> share_balance.amount;
      
    if (delta > 0 && share_balance > 0) {
      // Начисляем вознаграждение
      int64_t reward_amount_int = (share_balance * delta) / REWARD_SCALE;
      asset reward_amount = asset(reward_amount_int, _root_govern_symbol);

      // Обновляем вкладчика
      contributors.modify(contributor, same_payer, [&](auto &c) {
        c.pending_rewards       += reward_amount;              
        c.reward_per_share_last  = current_crps;
      });
    }
}
