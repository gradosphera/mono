void capital::fundprog(eosio::name coopname, asset amount, std::string memo) {
    auto payer = check_auth_and_get_payer_or_fail({_soviet, _gateway});

    Wallet::validate_asset(amount);

    // Используем новую core функцию для распределения средств
    Capital::Core::distribute_program_membership_funds(coopname, amount);
};
