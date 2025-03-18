[[eosio::action]]
void capital::refresh(name coopname, name application, checksum256 project_hash, name username) {
    check_auth_or_fail(_capital, coopname, application, "contribute"_n);

    // 1. Получаем ТЕКУЩИЙ проект
    auto exist_project = get_project(coopname, project_hash);
    eosio::check(exist_project.has_value(), "Проект не найден");

    project_index projects(_capital, coopname.value);
    auto project = projects.find(exist_project->id);

    // 2. Находим вкладчика в ТЕКУЩЕМ проекте
    auto exist = get_active_contributor_or_fail(coopname, project_hash, username);
    eosio::check(exist.has_value(), "Contributor not found in current project");
    
    contributor_index contributors(_capital, coopname.value);
    auto contributor = contributors.find(exist->id);

    // 3. Считаем дельту CRPS
    int64_t current_crps = project->membership_cumulative_reward_per_share;
    int64_t last_crps    = contributor->reward_per_share_last;
    int64_t delta        = current_crps - last_crps;

    if (delta > 0) {
        // Начисляем вознаграждение
        int64_t reward_amount_int = (contributor->share_balance.amount * delta) / REWARD_SCALE;
        asset reward_amount = asset(reward_amount_int, contributor->share_balance.symbol);

        // Обновляем вкладчика
        contributors.modify(contributor, same_payer, [&](auto &c) {
            c.pending_rewards       += reward_amount;              
            c.reward_per_share_last  = current_crps;
        });
    }

    // 4. Проверяем, есть ли родительский проект
    if (project->parent_project_hash != checksum256()) {
        // Находим родительский проект
        auto exist_parent = get_project(coopname, project->parent_project_hash);
        // Если родитель не найден, просто завершаем (или можно вернуть ошибку)
        if (!exist_parent.has_value()) {
            return; 
        }

        auto parent_project = projects.find(exist_parent->id);
        eosio::check(parent_project != projects.end(), "Ошибка при поиске родительского проекта");

        // 5. Ищем вкладчика в РОДИТЕЛЬСКОМ проекте по тому же username
        //    Предполагаем, что запись там уже существует.
        auto parent_contributor_opt = get_contributor(coopname, project->parent_project_hash, username);
        // если вкладчик не найден, можно либо ничего не делать, либо автоматически создать – зависит от требований
        if (!parent_contributor_opt.has_value()) {
            return; // нет записи о таком вкладчике в родительском проекте
        }

        // 6. Нашли родительского вкладчика
        auto parent_contributor = contributors.find(parent_contributor_opt->id);
        eosio::check(parent_contributor != contributors.end(), "Parent contributor record not found");

        // 7. Считаем дельту для родительского CRPS
        int64_t parent_crps    = parent_project->membership_cumulative_reward_per_share;
        int64_t parent_last    = parent_contributor->reward_per_share_last;
        int64_t delta_parent   = parent_crps - parent_last;

        if (delta_parent > 0) {
            // Начисляем вознаграждение
            int64_t reward_amount_int = (parent_contributor->share_balance.amount * delta_parent) / REWARD_SCALE;
            asset reward_amount = asset(reward_amount_int, parent_contributor->share_balance.symbol);

            // Обновляем родительского вкладчика
            contributors.modify(parent_contributor, same_payer, [&](auto &c) {
                c.pending_rewards        += reward_amount;
                c.reward_per_share_last   = parent_crps;
            });
        }
    }
}
