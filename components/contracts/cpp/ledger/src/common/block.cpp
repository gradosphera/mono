/**
 * @brief Блокировка средств на счете (перенос из available в blocked)
 * @param coopname - имя кооператива
 * @param account_id - идентификатор счета
 * @param quantity - сумма блокировки
 * @param comment - комментарий к операции
 */
[[eosio::action]]
void ledger::block(eosio::name coopname, uint64_t account_id, eosio::asset quantity, std::string comment) {
  require_recipient(coopname);
  
  eosio::name payer = coopname;
  if (!has_auth(coopname)) {
    payer = check_auth_and_get_payer_or_fail(contracts_whitelist);
  } 

  eosio::check(quantity.is_valid(), "Некорректная сумма");
  eosio::check(quantity.amount > 0, "Сумма должна быть положительной");
  eosio::check(quantity.symbol == _root_govern_symbol, "Некорректный символ валюты");
  
  laccounts_index accounts(_ledger, coopname.value);
  auto account_iter = accounts.find(account_id);
  eosio::check(account_iter != accounts.end(), "Счет не найден");

  // Проверяем достаточность доступных средств
  eosio::check(account_iter->available >= quantity, "Недостаточно доступных средств для блокировки");

  // Переносим средства из available в blocked
  accounts.modify(account_iter, payer, [&](auto& acc) {
    acc.available -= quantity;
    acc.blocked += quantity;
  });
} 