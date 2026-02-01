/**
 * @brief Принимает предложение по имущественному взносу в проект
 * Принимает предложение по имущественному взносу и обрабатывает связанные операции:
 * - Получает предложение по имущественному взносу
 * - Добавляет имущественный взнос к проекту
 * - Обновляет или создает сегмент пропертора с имущественным взносом
 * - Удаляет предложение после обработки
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя, одобрившего имущественный взнос
 * @param property_hash Хеш имущественного взноса для принятия
 * @param empty_document Пустой документ (не используется)
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от контракта совета
 */
void capital::approvepjprp(eosio::name coopname, eosio::name username, checksum256 property_hash, document2 empty_document) {
  require_auth(_soviet);

  // Получаем предложение
  auto property = Capital::ProjectProperties::get_property_or_fail(coopname, property_hash);
  
  auto project = Capital::Projects::get_project_or_fail(coopname, property.project_hash);
  
  auto segment = Capital::Segments::get_segment_or_fail(coopname, project.project_hash, username, "Сегмент пайщика не найден");
  
  // Добавляем имущественный взнос к проекту
  Capital::Projects::add_property_base(coopname, project.id, property.property_amount);

  // Обновляем или создаем сегмент пропертора с имущественным взносом
  Capital::Core::upsert_propertor_segment(coopname, segment.id, project, property.username, property.property_amount);

  // Удаляем предложение после обработки
  Capital::ProjectProperties::delete_property(coopname, property.id);  
};
