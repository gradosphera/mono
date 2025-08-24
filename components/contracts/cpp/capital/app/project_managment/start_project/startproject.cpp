/**
 * @brief Запускает проект на приём коммитов
 * Переводит проект в активный статус для приема коммитов:
 * - Проверяет существование проекта
 * - Валидирует что проект в статусе pending
 * - Обновляет статус проекта на active
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для запуска
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::startproject(name coopname, checksum256 project_hash) {
    require_auth(coopname);
    
    // Проверяем существование проекта и получаем его
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Проверяем, что проект в статусе "pending"
    eosio::check(project.status == Capital::Projects::Status::PENDING, "Проект должен быть в статусе 'pending'");
    
    // Обновляем статус проекта на "active"
    Capital::Projects::update_status(coopname, project_hash, Capital::Projects::Status::ACTIVE);
} 