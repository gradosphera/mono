/**
 * @brief Финансирует проект из внешних источников
 * Финансирует проект из внешних источников и распределяет членские взносы:
 * - Валидирует сумму финансирования
 * - Проверяет существование проекта
 * - Проверяет наличие долей для распределения членских взносов
 * - Распределяет членские взносы в проекте
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для финансирования
 * @param amount Сумма финансирования
 * @param memo Мемо для транзакции
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p _soviet или @p _gateway
 */
void capital::fundproj(eosio::name coopname, checksum256 project_hash, asset amount, std::string memo) {
    require_auth(coopname);
    
    Wallet::validate_asset(amount);

    auto exist_project = Capital::Projects::get_project(coopname, project_hash);
    eosio::check(exist_project.has_value(), "Проект не найден");

    // Проверяем, что в проекте есть доли для распределения
    eosio::check(exist_project->membership.total_shares.amount > 0, 
                 "В проекте нет долей для распределения членских взносов");

    Capital::Core::Generation::distribute_project_membership_funds(coopname, exist_project->id, amount);
};


