/**
 * @brief Добавление средств в паевой фонд кооператива.
 * Увеличивает доступные средства на паевом счете кооперативного кошелька.
 * @param coopname Наименование кооператива
 * @param quantity Количество средств для добавления
 * @ingroup public_actions
 * @ingroup public_fund_actions

 * @note Авторизация требуется от аккаунта из белого списка контрактов
 */
// атомарные транзакции фондового кошелька
// паевой счет
[[eosio::action]] void fund::addcirculate(
    eosio::name coopname,
    eosio::asset quantity)  /// < добавить сумму в паевой фонд
{
  name payer = check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  auto cooperative = get_cooperative_or_fail(coopname);
  print(quantity.to_string());
  coopwallet_index coopwallet(_fund, coopname.value);

  auto wal = coopwallet.find(0);

  eosio::check(wal != coopwallet.end(), "Кошелёк кооператива не найден");

  coopwallet.modify(wal, _fund, [&](auto &w) {
    w.circulating_account.available += quantity;
  });
};
