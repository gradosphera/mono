void capital::fund(eosio::name coopname, checksum256 project_hash, asset amount, std::string memo) {
    auto payer = check_auth_and_get_payer_or_fail({_soviet, _gateway});

    Wallet::validate_asset(amount);

    auto exist_project = get_project(coopname, project_hash);

    project_index projects(_capital, coopname.value);
    auto project = projects.find(exist_project->id);

    // Получаем коэффициент распределения (0.0 - все локально, 1.0 - все глобально)
    double ratio = project->global_distribution_ratio;

    // Рассчитываем суммы для глобального и локального фондов
    int64_t global_fund_amount = static_cast<int64_t>(amount.amount * ratio);
    int64_t local_fund_amount = amount.amount - global_fund_amount;

    asset global_fund(global_fund_amount, amount.symbol);
    asset local_fund(local_fund_amount, amount.symbol);

    // сделать через parent_project и распределение по цепочке
    projects.modify(project, coopname, [&](auto &p) {
      p.funded += amount;
      p.local_fund += local_fund;
      p.global_fund += global_fund;
    });
    
    
}
