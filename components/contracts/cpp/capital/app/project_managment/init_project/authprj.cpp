/**
 * @brief Авторизует проект советом
 * Авторизует проект советом кооператива:
 * - Проверяет подлинность документа решения совета
 * - Устанавливает флаг авторизации проекта
 * - Сохраняет документ решения совета
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для авторизации
 * @param decision Документ решения совета
 * @ingroup public_actions
 * @ingroup public_capital_actions
 *
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::authprj(eosio::name coopname, checksum256 project_hash, document2 decision) {
  require_auth(_soviet);

  // Проверяем заявление
  verify_document_or_fail(decision);

  // Проверяем статус проекта
  auto exist_project = Capital::Projects::get_project(coopname, project_hash);
  eosio::check(exist_project.has_value(), "Проект не найден");
  eosio::check(!exist_project->is_authorized, "Проект уже авторизован");

  // Устанавливаем авторизацию проекта
  Capital::Projects::authorize_project(coopname, exist_project.id, decision);
};