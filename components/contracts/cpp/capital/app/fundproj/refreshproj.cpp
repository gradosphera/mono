[[eosio::action]] void capital::refreshproj(name coopname, checksum256 project_hash, name username) {
    require_auth(username);
  
    // Проверяем существование проекта
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Обновляем кошелек проекта участника через CRPS систему
    Capital::Core::refresh_project_wallet_membership_rewards(coopname, project_hash, username);
}
