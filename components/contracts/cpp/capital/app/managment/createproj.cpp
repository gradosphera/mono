/**
 * @brief Создаёт проект
 * Выполняет проверки и создает новый проект в системе кооператива:
 * - Проверяет отсутствие проекта с указанным хешем
 * - Валидирует родительский хеш согласно правилам проектов
 * - Создает запись в таблице projects со статусом created
 * @param coopname Имя кооператива (scope таблицы)
 * @param project_hash Уникальный хэш проекта
 * @param parent_hash Хэш родителя или пустой хэш, если проект корневой
 * @param title Название проекта
 * @param description Описание проекта
 * @param meta Дополнительные метаданные проекта
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::createproj (
  eosio::name coopname, 
  checksum256 project_hash,
  checksum256 parent_hash,
  std::string title, 
  std::string description,
  std::string meta
) {
    require_auth(coopname);
    // Проверяем что проекта с таким хэшем еще не существует
    auto exist = Capital::Projects::get_project(coopname, project_hash);
    eosio::check(!exist.has_value(), "Проект с указанным хэшем уже существует");
    
    // Валидируем parent_hash согласно правилам проектов
    Capital::Projects::validate_parent_hash(coopname, parent_hash);
        
    Capital::Projects::create_project(coopname, project_hash, parent_hash, title, description, meta);
}