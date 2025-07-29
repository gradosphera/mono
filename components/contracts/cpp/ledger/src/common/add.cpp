/**
 * @brief Пополнение счета с автоматическим созданием если не существует
 * @param actor - кто предоставляет авторизацию
 * @param coopname - имя кооператива
 * @param account_id - идентификатор счета
 * @param quantity - сумма пополнения
 * @param comment - комментарий к операции
 */
[[eosio::action]]
void ledger::add(eosio::name coopname, uint64_t account_id, eosio::asset quantity, std::string comment) {
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
  
  if (account_iter == accounts.end()) {
    // Счет не существует - создаем автоматически, получая имя из ACCOUNT_MAP
    std::string account_name = Ledger::get_account_name_by_id(account_id);
    eosio::check(account_name != "Неизвестный счет", "Счет с таким ID не предусмотрен в плане счетов");
    
    // Создаем новый счет
    accounts.emplace(payer, [&](auto& acc) {
      acc.id = account_id;
      acc.name = account_name;
      acc.available = quantity;
      acc.blocked = eosio::asset(0, _root_govern_symbol);
      acc.writeoff = eosio::asset(0, _root_govern_symbol);
    });
  } else {
    // Счет существует - пополняем available
    accounts.modify(account_iter, payer, [&](auto& acc) {
      acc.available += quantity;
    });
  }
} 