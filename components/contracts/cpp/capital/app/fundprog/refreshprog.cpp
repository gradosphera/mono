/**
 * @brief Обновляет CRPS пайщика в программе капитализации
 * Обновляет CRPS (систему вознаграждений программы) пайщика:
 * - Обновляет CRPS contributor через core функцию
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-пайщика
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
[[eosio::action]] void capital::refreshprog(name coopname, name username) {
    require_auth(coopname);

    // Используем новую core функцию для обновления CRPS contributor
    Capital::Core::refresh_contributor_program_rewards(coopname, username);
};
