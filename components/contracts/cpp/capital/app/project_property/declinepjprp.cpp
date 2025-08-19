/**
 * @brief Отклонение предложения по имущественному взносу
 * \ingroup public_actions
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::declinepjprp(eosio::name coopname, checksum256 property_hash, std::string reason) {
  require_auth(_soviet);
  
  auto property = Capital::ProjectProperties::get_property_or_fail(coopname, property_hash);
  
  Capital::ProjectProperties::delete_property(coopname, property_hash);
}
