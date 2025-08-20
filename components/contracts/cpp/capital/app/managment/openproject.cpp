/**
 * @brief Открывает проект на приём инвестиций
 * Переводит проект в статус открытого для приема инвестиций:
 * - Проверяет существование проекта
 * - Валидирует что проект еще не открыт
 * - Открывает проект через доменную логику
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для открытия
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_openproject
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::openproject(name coopname, checksum256 project_hash) {
    require_auth(coopname);
    
    // Проверяем существование проекта и получаем его
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Проверяем, что проект в статусе "created"
    eosio::check(project.is_opened == false, "Проект уже открыт");
    
    // Открываем проект через доменную логику
    Capital::Projects::open_project(coopname, project_hash);
} 