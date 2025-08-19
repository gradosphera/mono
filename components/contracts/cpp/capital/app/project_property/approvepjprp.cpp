/**
 * @brief Принятие предложения по имущественному взносу
 * \ingroup public_actions
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::approvepjprp(eosio::name coopname, checksum256 property_hash, document2 empty_document) {
  require_auth(_soviet);

  // Получаем предложение
  auto property = Capital::ProjectProperties::get_property_or_fail(coopname, property_hash);
  
  // Добавляем имущественный взнос к проекту
  Capital::Projects::add_property_base(coopname, property.project_hash, property.property_amount);

  // Обновляем или создаем сегмент пропертора с имущественным взносом
  Capital::Core::upsert_propertor_segment(coopname, property.project_hash, property.username, property.property_amount);

  // Удаляем предложение после обработки
  Capital::ProjectProperties::delete_property(coopname, property_hash);  
};
