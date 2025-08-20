/**
 * @brief Удаление адреса кооператива
 * Удаляет существующий адрес из системы кооператива по его идентификатору.
 * @param coopname Наименование кооператива
 * @param chairman Наименование председателя совета
 * @param address_id Идентификатор адреса для удаления
 * @ingroup public_actions
 * @ingroup public_soviet_actions
 * @anchor soviet_deladdress
 * @note Авторизация требуется от аккаунта: @p chairman
 */
void soviet::deladdress(eosio::name coopname, eosio::name chairman, uint64_t address_id) {

  require_auth(chairman);

  auto cooperative = get_cooperative_or_fail(coopname);  

  addresses_index addresses(_soviet, coopname.value);
  auto address = addresses.find(address_id);
  eosio::check(address != addresses.end(), "Адрес не найден");
  
  addresses.erase(address);

}
