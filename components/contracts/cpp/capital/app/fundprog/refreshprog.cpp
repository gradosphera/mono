[[eosio::action]] void capital::refreshprog(name coopname, name username) {
    require_auth(coopname);

    // Используем новую core функцию для обновления CRPS contributor
    Capital::Core::refresh_contributor_program_rewards(coopname, username);
};
