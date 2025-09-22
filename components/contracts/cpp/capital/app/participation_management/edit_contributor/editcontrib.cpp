/**
 * @brief Редактирование параметров вкладчика
 * Обновляет поля hours_per_day и about для существующего вкладчика
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-вкладчика
 * @param hours_per_day Количество часов в день
 * @param about Информация о себе
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::editcontrib(eosio::name coopname, eosio::name username, uint64_t hours_per_day) {
  require_auth(coopname);

  // Проверяем существование активного вкладчика
  Capital::Contributors::get_active_contributor_or_fail(coopname, username);

  // Обновляем параметры вкладчика
  Capital::Contributors::edit_contributor(coopname, username, hours_per_day);
};
