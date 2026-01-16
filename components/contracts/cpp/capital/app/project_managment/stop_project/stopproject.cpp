/**
 * @brief Останавливает проект
 * Переводит проект из активного статуса обратно в статус ожидания:
 * - Проверяет существование проекта
 * - Валидирует что проект в статусе active
 * - Обновляет статус проекта на pending
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для остановки
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::stopproject(name coopname, checksum256 project_hash) {
    require_auth(coopname);

    // Проверяем существование проекта и получаем его
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);

    // Проверяем что проект авторизован советом
    eosio::check(project.is_authorized, "Проект не авторизован советом");

    // Проверяем, что проект в статусе "active"
    eosio::check(project.status == Capital::Projects::Status::ACTIVE, "Проект должен быть в статусе 'active'");

    // Обновляем статус проекта на "pending"
    Capital::Projects::update_status(coopname, project_hash, Capital::Projects::Status::PENDING);
}
