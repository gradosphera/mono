/**
 * @brief Завершает проект и начинает голосование
 * Переводит проект в статус голосования и инициализирует процесс:
 * - Проверяет существование проекта
 * - Валидирует что проект в статусе active
 * - Обновляет статус проекта на voting
 * - Инициализирует голосование по методу Водянова
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для начала голосования
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_startvoting
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::startvoting(name coopname, checksum256 project_hash) {
  require_auth(coopname);
  
  // Проверяем существование проекта и получаем его
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  // Проверяем, что проект в статусе "active"
  eosio::check(project.status == Capital::Projects::Status::ACTIVE, "Проект должен быть в статусе 'active'");
  
  // Обновляем статус проекта на "voting"
  Capital::Projects::update_status(coopname, project_hash, Capital::Projects::Status::VOTING);
  
  // Инициализируем голосование по методу Водянова
  Capital::Core::Voting::initialize_project_voting(coopname, project_hash);
} 