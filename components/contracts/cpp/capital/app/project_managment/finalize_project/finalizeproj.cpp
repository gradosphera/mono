/**
 * @brief Финализирует проект после завершения всех конвертаций
 * Финализирует проект и возвращает неиспользованную дельту инвестиций в глобальный пул:
 * - Проверяет что проект в статусе RESULT
 * - Проверяет что все сегменты сконвертированы (нет оставшихся сегментов)
 * - Рассчитывает неиспользованную дельту инвестиций на основе total_used_for_compensation
 * - Возвращает неиспользованную дельту в глобальный пул программы кооператива
 * - Устанавливает статус проекта на FINALIZED
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для финализации
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 * @note Экшен должен вызываться после того, как все участники выполнили convertsegm
 */
void capital::finalizeproj(eosio::name coopname, checksum256 project_hash) {
  require_auth(coopname);

  // Получаем проект
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  // Проверяем что проект в статусе RESULT
  eosio::check(project.status == Capital::Projects::Status::RESULT, 
               "Проект должен быть в статусе RESULT для финализации");

  // Проверяем что все участники сконвертировали свои сегменты
  eosio::check(Capital::Projects::are_all_segments_converted(coopname, project_hash),
               "Не все участники сконвертировали свои сегменты. Дождитесь завершения конвертации всеми участниками.");
               
  // Дополнительная проверка что в таблице сегментов ничего не осталось
  eosio::check(!Capital::Segments::has_project_segments(coopname, project_hash), 
               "В таблице сегментов остались записи. Ошибка синхронизации.");

  // Рассчитываем неиспользованную дельту инвестиций
  // 
  // total_received_investments - вся сумма полученных инвестиций (включая часть на расходы)
  // total_used_for_compensation - фактически выплачено участникам при конвертации в wallet + ссуды
  // used_expense_pool - фактически потрачено на расходы
  //
  // Неиспользованная дельта включает:
  // 1. Инвестиции, не использованные для компенсации участникам
  // 2. Зарезервированные на расходы (accumulated_expense_pool), но не потраченные (used_expense_pool)
  //
  // Примечание: total_returned_investments НЕ учитываем, т.к. это действие пользователей
  // и мы не знаем, все ли инвесторы вызвали returnunused
  
  int64_t total_actually_used = project.fact.total_used_for_compensation.amount +
                                project.fact.used_expense_pool.amount;
  
  // Неиспользованная дельта = всего получено инвестиций - фактически использовано
  int64_t unused_delta_amount = project.fact.total_received_investments.amount - total_actually_used;
  
  // Если есть неиспользованная дельта - возвращаем в глобальный пул через трекинговое действие
  if (unused_delta_amount > 0) {
    eosio::asset unused_delta = eosio::asset(unused_delta_amount, _root_govern_symbol);
    
    // Вызываем трекинговое действие через inline action для фиксации возврата
    action(
      permission_level{_capital, "active"_n},
      _capital,
      "returntopool"_n,
      std::make_tuple(coopname, project_hash, unused_delta)
    ).send();
  }

  // Устанавливаем статус проекта на FINALIZED
  Capital::Projects::update_status(coopname, project_hash, Capital::Projects::Status::FINALIZED);
  
}

