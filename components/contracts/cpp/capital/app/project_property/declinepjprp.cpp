/**
 * @brief Отклоняет предложение по имущественному взносу в проект
 * Отклоняет предложение по имущественному взносу и удаляет его из базы:
 * - Получает предложение по имущественному взносу
 * - Удаляет предложение из базы данных с указанием причины
 * @param coopname Наименование кооператива
 * @param property_hash Хеш имущественного взноса для отклонения
 * @param reason Причина отклонения предложения
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_declinepjprp
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::declinepjprp(eosio::name coopname, checksum256 property_hash, std::string reason) {
  require_auth(_soviet);
  
  auto property = Capital::ProjectProperties::get_property_or_fail(coopname, property_hash);
  
  Capital::ProjectProperties::delete_property(coopname, property_hash);
}
