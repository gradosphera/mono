void capital::fundproj(eosio::name coopname, checksum256 project_hash, asset amount, std::string memo) {
    auto payer = check_auth_and_get_payer_or_fail({ _soviet, _gateway });
    Wallet::validate_asset(amount);

    auto exist_project = get_project(coopname, project_hash);
    eosio::check(exist_project.has_value(), "Проект не найден");

    capital::distribute_project_membership_funds(coopname, exist_project->id, amount, 0);
};

void capital::distribute_project_membership_funds(eosio::name coopname, uint64_t project_id, asset amount, uint8_t level) {
    eosio::check(level < 12, "Превышено максимальное количество уровней распределения (12)");

    project_index projects(_capital, coopname.value);
    auto project = projects.find(project_id);
    eosio::check(project != projects.end(), "Проект не найден");

    double ratio = project -> parent_distribution_ratio;

    int64_t membership_parent_fund_amount = static_cast<int64_t>(amount.amount * ratio);
    int64_t membership_current_fund_amount = amount.amount - membership_parent_fund_amount;

    asset membership_parent_fund(membership_parent_fund_amount, amount.symbol);
    asset membership_current_fund(membership_current_fund_amount, amount.symbol);

    projects.modify(project, coopname, [&](auto &p) {
        p.membership_funded += amount;
        p.membership_available += membership_current_fund;

        if (project -> total_share_balance.amount > 0) {
            int64_t delta = (membership_current_fund.amount * REWARD_SCALE) / project->total_share_balance.amount;
            p.membership_cumulative_reward_per_share += delta;
        };
    });

    if (ratio > 0 && project -> parent_project_hash != checksum256()) {
        auto parent_project = get_project(coopname, project -> parent_project_hash);
        eosio::check(parent_project.has_value(), "Родительский проект не найден");

        distribute_project_membership_funds(coopname, parent_project->id, membership_parent_fund, level + 1);
    };
};
