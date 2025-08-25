/**
 * @brief Обновляет CRPS пайщика в программе капитализации
 * Обновляет CRPS (систему вознаграждений программы) пайщика:
 * - Обновляет CRPS в capital_wallet через core функцию
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-пайщика
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
[[eosio::action]] void capital::refreshprog(name coopname, name username) {
    require_auth(coopname);

    // Проверяем, что у пользователя есть баланс в программе капитализации
    eosio::asset share_balance = Capital::get_capital_user_share_balance(coopname, username);
    eosio::check(share_balance.amount > 0, "Пользователь не имеет баланса в программе капитализации");

    // Используем обновлённую core функцию для обновления CRPS через capital_wallet
    Capital::Core::refresh_contributor_program_rewards(coopname, username);
};
