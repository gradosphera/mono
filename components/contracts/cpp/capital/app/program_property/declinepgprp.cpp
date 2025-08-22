/**
 * @brief Отклоняет предложение по программному имущественному взносу
 * Отклоняет предложение по программному имущественному взносу и удаляет его из базы:
 * - Получает предложение по программному имущественному взносу
 * - Удаляет предложение из базы данных с указанием причины
 * @param coopname Наименование кооператива
 * @param property_hash Хеш программного имущественного взноса для отклонения
 * @param reason Причина отклонения предложения
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::declinepgprp(eosio::name coopname, checksum256 property_hash, std::string reason) {
  require_auth(_soviet);
  
  auto property = Capital::ProgramProperties::get_program_property_or_fail(coopname, property_hash);
  
  Capital::ProgramProperties::delete_program_property(coopname, property_hash);
}
