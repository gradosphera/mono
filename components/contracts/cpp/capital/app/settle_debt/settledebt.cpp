/**
 * @brief Погашает долг участника
 * Погашает долг участника в системе кооператива:
 * - Проверяет подлинность заявления о погашении
 * - Обрабатывает погашение долга (TODO: реализация)
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-должника
 * @param amount Сумма погашения долга
 * @param statement Заявление о погашении долга
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_settledebt
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::settledebt(name coopname, name username, eosio::asset amount, document2 statement){
  require_auth(coopname);
  //TODO: ?
  // // Получаем долг
  // auto exist_debt = Capital::Debts::get_debt_or_fail(coopname, debt_hash);
  
  
}