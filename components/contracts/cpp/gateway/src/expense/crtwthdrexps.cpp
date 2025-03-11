/**
 * @brief Создаёт запрос на оплату расходов, создание которых управляется другим контрактом.
 * 
 * @note Требуется авторизация белого листа контрактов.
 * @ingroup public_actions
 */
void gateway::crtwthdrexps(eosio::name coopname, eosio::name application, eosio::name username, checksum256 withdraw_hash, eosio::asset quantity, document document, name callback_contract, name callback_type, std::string memo){
  
  name payer = check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  Gateway::withdraws_index withdraws(_gateway, coopname.value);
  uint64_t id = get_global_id(_gateway, "withdraws"_n);

  auto cooperative = get_cooperative_or_fail(coopname);
  cooperative.check_symbol_or_fail(quantity);
  
  auto withdraw = Gateway::get_withdraw(coopname, withdraw_hash);
  
  eosio::check(!withdraw.has_value(), "Объект возврата уже существует с указанным хэшем");
  
  eosio::check(quantity.amount > 0, "Сумма вывода должна быть положительной");
  
  withdraws.emplace(payer, [&](auto &d) {
    d.id = id;
    d.withdraw_hash = withdraw_hash;
    d.callback_contract = callback_contract;
    d.callback_type = callback_type;
    d.username = username;
    d.coopname = coopname;
    d.document = document;
    d.quantity = quantity;
    d.status = "authorized"_n;
    d.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
  });
};
