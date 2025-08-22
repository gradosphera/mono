/**
 * @brief Обновляет CRPS для пайщика
 * Обновляет CRPS (систему вознаграждений программы) для пайщика:
 * - Проверяет существование пайщика с основным договором УХД
 * - Валидирует активность основного договора УХД
 * - Обновляет CRPS для пайщика через ядро
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-пайщика
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
[[eosio::action]] void capital::refreshpcrps(name coopname, name username) {
    require_auth(coopname);

    // Проверяем основной договор УХД
    auto exist_contributor = Capital::Contributors::get_contributor(coopname, username);
    eosio::check(exist_contributor.has_value(), "Пайщик не подписывал основной договор УХД");
    eosio::check(exist_contributor->status == Capital::Contributors::Status::ACTIVE, 
                 "Основной договор УХД не активен");

    // Обновляем CRPS для contributor
    Capital::Core::refresh_contributor_program_rewards(coopname, username);
}