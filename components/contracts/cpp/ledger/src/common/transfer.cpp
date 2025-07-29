/**
 * @brief Перевод средств между счетами
 * @param coopname - имя кооператива
 * @param from_account_id - идентификатор счета списания
 * @param to_account_id - идентификатор счета зачисления
 * @param quantity - сумма перевода
 * @param comment - комментарий к операции
 */
[[eosio::action]]
void ledger::transfer(eosio::name coopname, uint64_t from_account_id, uint64_t to_account_id, eosio::asset quantity, std::string comment) {
  require_recipient(coopname);
  
  eosio::name payer = coopname;
  
  if (!has_auth(coopname)) {
    payer = check_auth_and_get_payer_or_fail(contracts_whitelist);
  } 


  eosio::check(quantity.is_valid(), "Некорректная сумма");
  eosio::check(quantity.amount > 0, "Сумма должна быть положительной");
  eosio::check(quantity.symbol == _root_govern_symbol, "Некорректный символ валюты");
  eosio::check(from_account_id != to_account_id, "Счета списания и зачисления должны отличаться");

  laccounts_index accounts(_ledger, coopname.value);
  
  // Проверяем счет списания
  auto from_account_iter = accounts.find(from_account_id);
  eosio::check(from_account_iter != accounts.end(), "Счет списания не найден");
  eosio::check(from_account_iter->available >= quantity, "Недостаточно доступных средств для перевода");

  // Проверяем счет зачисления или создаем его
  auto to_account_iter = accounts.find(to_account_id);
  
  // Списываем с источника
  accounts.modify(from_account_iter, payer, [&](auto& acc) {
    acc.available -= quantity;
  });

  if (to_account_iter == accounts.end()) {
    // Счет получателя не существует - создаем автоматически
    std::string account_name = Ledger::get_account_name_by_id(to_account_id);
    eosio::check(account_name != "Неизвестный счет", "Счет получателя с таким ID не предусмотрен в плане счетов");
    
    accounts.emplace(payer, [&](auto& acc) {
      acc.id = to_account_id;
      acc.name = account_name;
      acc.available = quantity;
      acc.blocked = eosio::asset(0, _root_govern_symbol);
      acc.writeoff = eosio::asset(0, _root_govern_symbol);
    });
  } else {
    // Зачисляем на получателя
    accounts.modify(to_account_iter, payer, [&](auto& acc) {
      acc.available += quantity;
    });
  }
  
  // Проверяем и удаляем счет источника если он полностью пуст
  if (from_account_iter->is_empty()) {
    accounts.erase(from_account_iter);
  }
} 