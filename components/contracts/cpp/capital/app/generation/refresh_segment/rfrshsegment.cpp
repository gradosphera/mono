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
  
  auto segment = Capital::Segments::get_segment_or_fail(coopname, project_hash, username, "Сегмент пайщика не найден");
    
  // Если проект завершен и сегмент еще в генерации, переводим в статус готовности к внесению результата
  if (project.status == Capital::Projects::Status::RESULT && segment.status == Capital::Segments::Status::GENERATION) {
    // Обновляем сегмент участника через CRPS систему перед проверкой стоимости
    Capital::Core::refresh_segment(coopname, segment.id, project);
    
    // Получаем обновленный сегмент по ID (извлечение по хэшу после модификации запрещено)
    Capital::Segments::segments_index segments(_capital, coopname.value);
    auto updated_segment = segments.get(segment.id, "Сегмент пайщика не найден после обновления");

    // Если у участника нет интеллектуального вклада и нет долга, переводим сразу в SKIPPED
    // так как ему нечего вносить через pushrslt и нечего подписывать в актах
    if (updated_segment.intellectual_cost.amount == 0 && updated_segment.debt_amount.amount == 0) {
      Capital::Segments::update_segment_status(coopname, project_hash, username, Capital::Segments::Status::SKIPPED);
    } else {
      Capital::Segments::update_segment_status(coopname, project_hash, username, Capital::Segments::Status::READY);
    }
  } else {
    // Обновляем сегмент участника через CRPS систему для всех остальных случаев
    Capital::Core::refresh_segment(coopname, segment.id, project);
  }
} 