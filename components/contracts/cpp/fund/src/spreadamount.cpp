/**
 * @brief Метод распределения членской части взноса по фондам накопления с остатком в 
 кошельке для распределения по фондам списания. Распределить членские взносы по фондам накопления, положив остаток на накопительный счет списания. На входе мы получаем общую членскую часть, которую распределяем по счетам.
 * 
 * @param coopname 
 * @param quantity 
 */
[[eosio::action]] void fund::spreadamount(eosio::name coopname,
                                          eosio::asset quantity) {
  
  name payer = check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  auto cooperative = get_cooperative_or_fail(coopname);

  coopwallet_index coopwallet(_fund, coopname.value);
  auto wal = coopwallet.find(0);

  eosio::check(wal != coopwallet.end(), "Кошелёк кооператива не найден");

  accfunds_index accfunds(_fund, coopname.value);
  eosio::asset total_accumulated = asset(0, cooperative.initial.symbol);

  // готовим пакет транзакций пополнения счетов накопления
  for (auto it = accfunds.begin(); it != accfunds.end(); it++) {
    eosio::asset fund_quantity = it->percent * quantity / HUNDR_PERCENTS;
    total_accumulated += fund_quantity;
    action(permission_level{_fund, "active"_n}, _fund, "addaccum"_n,
           std::make_tuple(coopname, it->id, fund_quantity))
        .send();
  };

  // считаем сколько не выплачено по счетам накопления
  eosio::asset remain_amount = quantity - total_accumulated;

  // начисляем на накопительный счет списания
  coopwallet.modify(wal, payer, [&](auto &w) {
    w.accumulative_expense_account.available += remain_amount;
  });
};
