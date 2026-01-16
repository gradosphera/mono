/**
 * @brief Закрывает проект от приёма инвестиций
 * Переводит проект в статус закрытого для приема инвестиций:
 * - Проверяет существование проекта
 * - Валидирует что проект открыт для инвестиций
 * - Закрывает проект через доменную логику
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для закрытия
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::closeproject(name coopname, checksum256 project_hash) {
    require_auth(coopname);

    // Проверяем существование проекта и получаем его
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);

    // Проверяем что проект авторизован советом
    eosio::check(project.is_authorized, "Проект не авторизован советом");

    // Проверяем, что проект открыт для инвестиций
    eosio::check(project.is_opened == true, "Проект уже закрыт или не был открыт для инвестиций");

    // Закрываем проект
    Capital::Projects::close_project(coopname, project_hash);
}
