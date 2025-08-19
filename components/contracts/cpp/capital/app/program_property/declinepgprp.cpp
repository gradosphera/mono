/**
 * @brief Отклонение предложения по программному имущественному взносу
 * \ingroup public_actions
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::declinepgprp(eosio::name coopname, checksum256 property_hash, std::string reason) {
  require_auth(_soviet);
  
  auto property = Capital::ProgramProperties::get_program_property_or_fail(coopname, property_hash);
  
  Capital::ProgramProperties::delete_program_property(coopname, property_hash);
}
