/**
 * @brief Авторизация предложения по программному имущественному взносу советом
 * \ingroup public_actions
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::authpgprp(eosio::name coopname, checksum256 property_hash, document2 decision) {
  require_auth(_soviet);

  // Проверяем документ
  verify_document_or_fail(decision);

  // Получаем предложение
  auto property = Capital::ProgramProperties::get_program_property_or_fail(coopname, property_hash);
  
  // Проверяем статус
  eosio::check(property.status == Capital::ProgramProperties::Status::APPROVED, 
               "Предложение должно быть в статусе 'approved'");
  
  // Сохраняем решение совета
  Capital::ProgramProperties::set_program_property_authorization(coopname, property_hash, decision);
  
  // Обновляем статус на authorized
  Capital::ProgramProperties::update_program_property_status(coopname, property_hash, 
                                                           Capital::ProgramProperties::Status::AUTHORIZED);
};
