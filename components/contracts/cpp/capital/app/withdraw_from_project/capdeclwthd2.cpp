/**
 * @brief Отклоняет возврат из проекта советом
 * Отклоняет возврат из проекта советом и возвращает средства в проект:
 * - Получает объект возврата
 * - Возвращает available средства в проект
 * - Удаляет объект возврата
 * @param coopname Наименование кооператива
 * @param withdraw_hash Хеш заявки на возврат для отклонения
 * @param reason Причина отклонения возврата
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_capdeclwthd2
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::capdeclwthd2(name coopname, checksum256 withdraw_hash, std::string reason) {
  require_auth(_soviet);
  
  auto exist_withdraw = Capital::get_project_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект возврата не найден");
  
  Capital::project_withdraws_index project_withdraws(_capital, coopname.value);
  auto withdraw = project_withdraws.find(exist_withdraw -> id);
  
  // Возвращаем available средства в проект, так как запрос на возврат отклонен
  Capital::Projects::add_membership_available(coopname, withdraw->project_hash, withdraw->amount);
  
  project_withdraws.erase(withdraw);
}