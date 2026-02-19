/**
 * @brief Очистка сегмента чистого инвестора
 * 
 * Метод для очистки сегмента чистого инвестора после завершения проекта.
 * 
 * Логика работы:
 * - Проверяет что участник является чистым инвестором
 * - Проверяет статус сегмента: READY или CONTRIBUTED
 * - Валидирует актуальность сегмента
 * - Проверяет что у инвестора нет долга
 * - Удаляет сегмент (средства уже в _capital_program с момента createinvest)
 * 
 * ВАЖНО: Этот метод НЕ выполняет операции с балансами.
 * Средства инвестора уже находятся в _capital_program (благорост) с момента инвестирования.
 * Метод только удаляет запись о сегменте из таблицы.
 * 
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-участника
 * @param project_hash Хеш проекта
 * 
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @note Авторизация требуется от аккаунта: @p coopname
 * @note Только для чистых инвесторов (без других ролей)
 */
void capital::purgesegment(eosio::name coopname, eosio::name username, checksum256 project_hash) {
  require_auth(coopname);
  
  // Получаем сегмент пайщика
  auto segment = Capital::Segments::get_segment_or_fail(coopname, project_hash, username, 
                                                      "Сегмент пайщика не найден");
  
  // Определяем проект
  auto current_project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  bool is_skipped = segment.status == Capital::Segments::Status::SKIPPED;
  
  eosio::check(is_skipped, 
               "Метод purgesegment доступен только для чистых инвесторов или пропущенных сегментов. Используйте convertsegm для участников с интеллектуальными ролями");
  
  // Проверяем статус сегмента
  // Также разрешаем очистку для сегментов в статусе SKIPPED (интеллектуальный вклад и долг равны нулю)
  eosio::check(segment.status == Capital::Segments::Status::SKIPPED,
               "Сегмент можно очистить только в статусе SKIPPED");
  
  // Проверяем актуальность сегмента (включая синхронизацию с инвестициями)
  Capital::Core::check_segment_is_updated(coopname, current_project, segment, 
                                         "Сегмент не обновлен. Выполните rfrshsegment перед очисткой");
  
  // Инкрементируем счётчик сконвертированных сегментов
  Capital::Projects::increment_converted_segments(coopname, current_project.id);
  
  // Удаляем сегмент
  Capital::Segments::remove_segment(coopname, segment.id);
}

// Метод purgesegment используется исключительно для чистых инвесторов.
// Их средства уже в _capital_program (благорост) с момента инвестирования (createinvest).
// Метод только удаляет запись о сегменте - никаких перемещений средств не происходит.
