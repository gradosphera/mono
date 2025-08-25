/**
 * @brief Возвращает неиспользованные инвестиции
 * Возвращает неиспользованные инвестиции инвестора из закрытого проекта:
 * - Проверяет что проект закрыт
 * - Валидирует что пользователь является инвестором проекта
 * - Рассчитывает неиспользованную сумму инвестиций
 * - Разблокирует неиспользованные средства и возвращает в кошелек программы
 * - Обновляет проект - увеличивает сумму возвращенных инвестиций
 * - Обновляет сегмент - устанавливает фактически используемую сумму
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта
 * @param username Наименование пользователя-инвестора
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::returnunused(name coopname, checksum256 project_hash, name username) {
  require_auth(coopname);

  // Проверяем, что проект выполнен
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  eosio::check(project.status == Capital::Projects::Status::COMPLETED, "Проект должен быть выполнен");

  // Получаем сегмент инвестора
  auto segment = Capital::Segments::get_segment_or_fail(coopname, project_hash, username, "Сегмент инвестора не найден");
  eosio::check(segment.is_investor, "Пользователь не является инвестором проекта");

  // Рассчитываем неиспользованную сумму
  eosio::check(segment.investor_base <= segment.investor_amount, "Ошибка: использованная сумма больше инвестированной");
  eosio::asset unused_amount = segment.investor_amount - segment.investor_base;
  eosio::check(unused_amount.amount > 0, "Нет неиспользованных средств для возврата");

  // Получаем информацию о contributor для возврата средств
  auto contributor = Capital::Contributors::get_active_contributor_or_fail(coopname, username);
  
  std::string memo = Capital::Memo::get_return_unused_investments_memo();

  // Разблокируем неиспользованные средства и возвращаем в кошелек программы
  Wallet::sub_blocked_funds(_capital, coopname, username, unused_amount, _source_program, memo);
  Wallet::add_available_funds(_capital, coopname, username, unused_amount, _wallet_program, memo);

  // Обновляем проект - увеличиваем сумму возвращенных инвестиций
  Capital::Projects::increase_total_returned_investments(coopname, project.id, unused_amount);
  
  // Обновляем сегмент - устанавливаем фактически используемую сумму инвестиций
  Capital::Segments::set_investor_base_amount_on_return_unused(coopname, segment.id, segment.investor_base);
}