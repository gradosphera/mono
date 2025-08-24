/**
 * @brief Обновляет кошелек проекта участника
 * Обновляет кошелек проекта участника через CRPS систему:
 * - Проверяет существование проекта
 * - Обновляет кошелек проекта участника через CRPS систему
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта
 * @param username Наименование пользователя-участника
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p username
 */
[[eosio::action]] void capital::refreshproj(name coopname, checksum256 project_hash, name username) {
    require_auth(username);
  
    // Проверяем существование проекта
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Обновляем кошелек проекта участника через CRPS систему
    Capital::Core::refresh_project_wallet_membership_rewards(coopname, project_hash, username);
}
