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

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::rfrshsegment(eosio::name coopname, checksum256 project_hash, eosio::name username) {
  require_auth(coopname);
  
  // Проверяем существование проекта
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  auto segment_opt = Capital::Segments::get_segment_or_fail(coopname, project_hash, username, "Сегмент пайщика не найден");
    
  // Если проект завершен и сегмент еще в генерации, переводим в статус готовности к внесению результата
  if (project.status == Capital::Projects::Status::RESULT && segment_opt.status == Capital::Segments::Status::GENERATION) {
    Capital::Segments::update_segment_status(coopname, project_hash, username, Capital::Segments::Status::READY);
  }

  // Обновляем сегмент участника через CRPS систему
  Capital::Core::refresh_segment(coopname, project_hash, username);
} 