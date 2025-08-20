/**
 * @brief Устанавливает мастера проекта
 * Назначает мастера для управления проектом:
 * - Проверяет существование проекта
 * - Валидирует что пользователь подписал договор УХД
 * - Проверяет что пользователь является участником проекта
 * - Назначает мастера проекта
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта
 * @param master Наименование пользователя-мастера
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_setmaster
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::setmaster(name coopname, checksum256 project_hash, name master) {
    require_auth(coopname);
    
    // Проверяем что проект существует
    auto project = Capital::Projects::get_project(coopname, project_hash);
    eosio::check(project.has_value(), "Проект не найден");
    
    // Проверяем что пользователь подписал основной договор УХД
    auto contributor = Capital::Contributors::get_contributor(coopname, master);
    eosio::check(contributor.has_value(), "Мастер должен подписать основной договор УХД");
    eosio::check(contributor -> status == Capital::Contributors::Status::ACTIVE, "Основной договор УХД не активен");
    
    // Проверяем что пользователь является участником проекта
    eosio::check(Capital::Contributors::is_contributor_has_appendix_in_project(coopname, project_hash, master), 
                 "Мастер должен быть участником проекта");
    
    // Назначаем мастера проекта
    Capital::Projects::set_master(coopname, project -> id, master);
} 