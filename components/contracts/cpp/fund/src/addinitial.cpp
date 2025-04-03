/**
 * @brief Атомарный метод добавления вступительного взноса на счет кошелька кооператива.
 * 
 * @param coopname
 * @param quantity 
 */
[[eosio::action]] void fund::addinitial(eosio::name coopname,
                                        eosio::asset quantity) {
  name payer = check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  auto cooperative = get_cooperative_or_fail(coopname);

  coopwallet_index coopwallet(_fund, coopname.value);
  auto wal = coopwallet.find(0);
  
  coopwallet.modify(
      wal, payer, [&](auto &row) { row.initial_account.available += quantity; });
}
