[[eosio::action]] void capital::refreshpcrps(name coopname, name application, name username) {
    check_auth_or_fail(_capital, coopname, application, "refreshpcrps"_n);

    // Проверяем основной договор УХД
    auto exist_contributor = Capital::Contributors::get_contributor(coopname, username);
    eosio::check(exist_contributor.has_value(), "Пайщик не подписывал основной договор УХД");
    eosio::check(exist_contributor->status == Capital::Contributors::Status::ACTIVE, 
                 "Основной договор УХД не активен");

    // Обновляем CRPS для contributor
    Capital::Core::refresh_contributor_program_rewards(coopname, username);
}