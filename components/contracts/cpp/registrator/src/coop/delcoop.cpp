/**
 * @brief Удаление кооператива.
 * Удаляет кооператив из системы
 * @param administrator Имя администратора
 * @param coopname Наименование кооператива для удаления
 * @ingroup public_actions
 * @ingroup public_registrator_actions

 * @note Авторизация требуется от аккаунта: @p provider или @p administrator
 */
[[eosio::action]] void registrator::delcoop(eosio::name administrator, eosio::name coopname)
{
  check_auth_or_fail(_registrator, _provider, administrator, "delcoop"_n);

  get_cooperative_or_fail(_provider);
  
  eosio::check(_provider != coopname, "Провайдер не может быть удален");
    
  cooperatives2_index coops(_registrator, _registrator.value);
  auto coop = coops.find(coopname.value);
  
  eosio::check(coop != coops.end(), "Кооператив не найден");
  
  coops.erase(coop);
}
