/**
 * @brief Обновляет сегмент участника через CRPS систему
 * Обновляет сегмент участника проекта через систему CRPS:
 * - Проверяет существование проекта
 * - Обновляет сегмент участника через CRPS систему
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта
 * @param username Наименование пользователя-участника
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_rfrshsegment
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::rfrshsegment(eosio::name coopname, checksum256 project_hash, eosio::name username) {
  require_auth(coopname);
  
  // Проверяем существование проекта
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  // Обновляем сегмент участника через CRPS систему
  Capital::Core::refresh_segment(coopname, project_hash, username);
} 