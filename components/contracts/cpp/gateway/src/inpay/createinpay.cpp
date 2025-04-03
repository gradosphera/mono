/**
\ingroup public_actions
 * @brief Создает новую запись входящего платежа в контракте `gateway`.
 */
[[eosio::action]] void gateway::createinpay(eosio::name coopname, eosio::name username, checksum256 income_hash, eosio::asset quantity, eosio::name callback_contract, eosio::name confirm_callback, eosio::name decline_callback) {
  name payer = check_auth_and_get_payer_or_fail(contracts_whitelist);

  Wallet::validate_asset(quantity);
  
  auto cooperative = get_cooperative_or_fail(coopname);
  
  eosio::check(callback_contract != ""_n, "Коллбэк контракт должен быть установлен");
  eosio::check(confirm_callback != ""_n, "Действие для коллбэка-успеха должено быть установлено");
  eosio::check(decline_callback != ""_n, "Действие для коллбэка-отлонения должно быть установлено");
  
  uint64_t income_id = get_global_id_in_scope(_gateway, coopname, "incomes"_n);
  auto exist_income = Gateway::get_income(coopname, income_hash);
  
  eosio::check(!exist_income.has_value(), "Входящий платеж с указанным hash уже существует");
  Gateway::incomes_index incomes(_gateway, coopname.value);
  
  //TODO: payer should be is coopname
  incomes.emplace(_gateway, [&](auto &d) {
    d.id = income_id;
    d.income_hash = income_hash;
    d.username = username;
    d.coopname = coopname;
    d.quantity = quantity;
    d.status = "pending"_n;
    d.callback_contract = callback_contract;
    d.confirm_callback = confirm_callback;
    d.decline_callback = decline_callback;
  });  
}