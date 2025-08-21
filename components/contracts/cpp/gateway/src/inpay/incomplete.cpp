/**
 * @brief Завершение обработки входящего платежа.
 * Завершает обработку входящего платежа и вызывает коллбэк успеха.
 * @param coopname Наименование кооператива
 * @param income_hash Хэш входящего платежа
 * @ingroup public_actions
 * @ingroup public_gateway_actions
 * @anchor gateway_incomplete
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void gateway::incomplete(eosio::name coopname, checksum256 income_hash) {
  require_auth(coopname);

  auto exist_income = Gateway::get_income(coopname, income_hash);
  eosio::check(exist_income.has_value(), "Входящий платеж не найден");
  
  Gateway::incomes_index incomes(_gateway, coopname.value);
  auto income = incomes.find(exist_income -> id);

  eosio::check(income != incomes.end(), "Объект процессинга не найден");
  eosio::check(income -> status == "pending"_n, "Статус платежа должен быть pending");

  action(
    permission_level{ _gateway, "active"_n},
    income -> callback_contract,
    income -> confirm_callback,
    std::make_tuple(coopname, income_hash)
  ).send();
  
  incomes.erase(income);
};