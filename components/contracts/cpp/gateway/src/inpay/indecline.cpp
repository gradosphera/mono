void gateway::indecline(eosio::name coopname, checksum256 income_hash, std::string reason) {
  require_auth(coopname);
  
  auto cooperative = get_cooperative_or_fail(coopname);  
  
  auto exist_income = Gateway::get_income(coopname, income_hash);
  eosio::check(exist_income.has_value(), "Входящий платеж не найден");
  
  Gateway::incomes_index incomes(_gateway, coopname.value);
  auto income = incomes.find(exist_income -> id);

  eosio::check(income != incomes.end(), "Объект процессинга не найден");
  
  action(
    permission_level{ _gateway, "active"_n},
    income -> callback_contract,
    income -> decline_callback,
    std::make_tuple(coopname, income -> income_hash, reason)
  ).send();
  
  //удаляем объект из шлюза
  incomes.erase(income); 
};