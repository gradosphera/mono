[[eosio::action]] void capital::refreshprog(name coopname, name application, name username) {
    check_auth_or_fail(_capital, coopname, application, "refreshprog"_n);

    // Используем новую core функцию для обновления CRPS contributor
    Capital::Core::refresh_contributor_program_rewards(coopname, username);
};
