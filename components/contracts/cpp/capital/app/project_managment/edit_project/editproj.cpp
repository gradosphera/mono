/**
 * @brief Редактирует проект
 * Выполняет проверки и редактирует существующий проект в системе кооператива:
 * - Проверяет существование проекта с указанным хэшем
 * - Проверяет что проект не завершен
 * - Обновляет указанные поля проекта
 * @param coopname Имя кооператива (scope таблицы)
 * @param project_hash Уникальный хэш проекта для редактирования
 * @param title Новое название проекта
 * @param description Новое описание проекта
 * @param invite Новое приглашение к проекту
 * @param meta Новые метаданные проекта
 * @param data Новые данные/шаблон проекта
 * @param can_convert_to_project Разрешена ли конвертация в кошелек данного проекта
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::editproj (
  eosio::name coopname,
  checksum256 project_hash,
  std::string title,
  std::string description,
  std::string invite,
  std::string meta,
  std::string data,
  bool can_convert_to_project
) {
    require_auth(coopname);
  
    // Проверяем что проект существует
    auto exist = Capital::Projects::get_project(coopname, project_hash);
    eosio::check(exist.has_value(), "Проект с указанным хэшем не найден.");

    // Проверяем что проект не завершен
    eosio::check(exist->status != Capital::Projects::Status::COMPLETED &&
                 exist->status != Capital::Projects::Status::CLOSED,
                 "Нельзя редактировать завершенный проект");

    Capital::Projects::edit_project(coopname, project_hash, title, description, invite, meta, data, can_convert_to_project);
}
