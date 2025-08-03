void capital::fundproj(eosio::name coopname, checksum256 project_hash, asset amount, std::string memo) {
    auto payer = check_auth_and_get_payer_or_fail({ _soviet, _gateway });
    Wallet::validate_asset(amount);

    auto exist_project = Capital::Projects::get_project(coopname, project_hash);
    eosio::check(exist_project.has_value(), "Проект не найден");

    Capital::Core::Generation::distribute_project_membership_funds(coopname, exist_project->id, amount, 0);
};


