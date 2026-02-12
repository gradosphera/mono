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
  
  // Проверяем что участник является чистым инвестором
  bool is_pure_inv = Capital::Segments::is_pure_investor(segment);
  eosio::check(is_pure_inv, 
               "Метод purgesegment доступен только для чистых инвесторов. Используйте convertsegm для участников с интеллектуальными ролями");
  
  // Проверяем статус сегмента
  // Чистый инвестор может очистить сегмент уже в статусе READY (не требуется внесение результата)
  eosio::check(segment.status == Capital::Segments::Status::READY || 
               segment.status == Capital::Segments::Status::CONTRIBUTED,
               "Сегмент чистого инвестора можно очистить только в статусе READY или CONTRIBUTED");
  
  // Проверяем актуальность сегмента (включая синхронизацию с инвестициями)
  Capital::Core::check_segment_is_updated(coopname, current_project, segment, 
                                         "Сегмент не обновлен. Выполните rfrshsegment перед очисткой");
  
  // Чистые инвесторы не могут погашать долг через pushrslt, поэтому у них не должно быть долга
  eosio::check(segment.debt_amount.amount == 0, 
               "Чистые инвесторы не могут иметь непогашенный долг. Сначала погасите долг.");
  
  // Проверяем что у инвестора есть инвестиционная база
  eosio::check(segment.investor_base.amount > 0,
               "У чистого инвестора должна быть инвестиционная база для очистки сегмента");
  
  // Средства инвестора (investor_base) уже находятся в _capital_program с момента createinvest
  // Никаких операций с балансами не требуется
  
  // Инкрементируем счётчик сконвертированных сегментов
  Capital::Projects::increment_converted_segments(coopname, current_project.id);
  
  // Удаляем сегмент
  Capital::Segments::remove_segment(coopname, segment.id);
}

// Метод purgesegment используется исключительно для чистых инвесторов.
// Их средства уже в _capital_program (благорост) с момента инвестирования (createinvest).
// Метод только удаляет запись о сегменте - никаких перемещений средств не происходит.
