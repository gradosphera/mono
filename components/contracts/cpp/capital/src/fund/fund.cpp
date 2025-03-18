void capital::fund(eosio::name coopname, checksum256 project_hash, asset amount, std::string memo) {
    auto payer = check_auth_and_get_payer_or_fail({_soviet, _gateway});

    Wallet::validate_asset(amount);

    auto exist_project = get_project(coopname, project_hash);
    eosio::check(exist_project.has_value(), "Проект не найден");
    
    project_index projects(_capital, coopname.value);
    auto project = projects.find(exist_project->id);

    // Коэффициент распределения (0.0 - всё в проект, 1.0 - всё в глобал).
    double ratio = project->membership_parent_distribution_ratio;

    // Считаем суммы для локального и глобального фондов
    int64_t membership_parent_fund_amount = static_cast<int64_t>(amount.amount * ratio);
    int64_t membership_current_fund_amount = amount.amount - membership_parent_fund_amount;

    asset membership_parent_fund(membership_parent_fund_amount, amount.symbol);
    asset membership_current_fund(membership_current_fund_amount, amount.symbol);

    // Обновляем поля проекта
    projects.modify(project, coopname, [&](auto &p) {
        p.membership_funded          += amount;
        p.membership_available += membership_current_fund;

        // Если в проекте уже есть доли участников (total_shares), 
        // распределяем поступивший membership_current_fund пропорционально им
        if (p.membership_total_shares.amount > 0) {
            // REWARD_SCALE - ваш масштаб (например, 1e8), чтобы не терять точность
            int64_t delta = (membership_current_fund.amount * REWARD_SCALE)
                            / p.membership_total_shares.amount;
            p.membership_cumulative_reward_per_share += delta;
        } 
        // Иначе, если нет долей, просто накапливаем средства (p.membership_current_fund)
        // и не трогаем membership_cumulative_reward_per_share
    });
    
    // Если есть родительский проект, добавляем программное распределение в него
    if (project -> parent_project_hash != checksum256()) {
      auto exist_parent = get_project(coopname, project->parent_project_hash);
      eosio::check(exist_parent.has_value(), "Родительский проект не найден");

      auto parent_project = projects.find(exist_parent->id);
      eosio::check(parent_project != projects.end(), "Ошибка при поиске родительского проекта");

      projects.modify(parent_project, coopname, [&](auto &p) {
          p.membership_funded += membership_parent_fund;  // Отмечаем факт поступления
          p.membership_available += membership_parent_fund;
          
          if (p.membership_total_shares.amount > 0) {
            int64_t delta = (membership_parent_fund.amount * REWARD_SCALE) / p.membership_total_shares.amount;
            p.membership_cumulative_reward_per_share += delta;
          };
      });
    }
}
