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
void capital::editcontrib(eosio::name coopname, eosio::name username, eosio::asset rate_per_hour, uint64_t hours_per_day) {
  require_auth(coopname);

  // Проверяем существование активного вкладчика
  Capital::Contributors::get_active_contributor_or_fail(coopname, username);

  Wallet::validate_asset(rate_per_hour);
  eosio::check(hours_per_day >= 0, "Количество часов в день должно быть неотрицательным");
  eosio::check(rate_per_hour.amount >= 0, "Ставка за час должна быть неотрицательной");
  eosio::check(rate_per_hour.amount <= 30000000, "Ставка за час должна быть не более 30000000");
  eosio::check(hours_per_day <= 8, "Количество часов в день должно быть не более 8");
  
  // Обновляем параметры вкладчика
  Capital::Contributors::edit_contributor(coopname, username, rate_per_hour, hours_per_day);
};
