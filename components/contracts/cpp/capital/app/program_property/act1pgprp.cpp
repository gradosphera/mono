/**
 * @brief Подписание акта 1 по программному имущественному взносу
 * \ingroup public_actions
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::act1pgprp(eosio::name coopname, eosio::name username, checksum256 property_hash, document2 act) {
  require_auth(coopname);

  
  // Проверяем документ
  verify_document_or_fail(act, { username });
  
  // Получаем предложение
  auto property = Capital::ProgramProperties::get_program_property_or_fail(coopname, property_hash);
  
  // Проверяем статус
  eosio::check(property.status == Capital::ProgramProperties::Status::AUTHORIZED, 
               "Предложение должно быть в статусе 'authorized'");
  
  // Проверяем права участника
  eosio::check(property.username == username, 
               "Только участник может подписать акт для своего предложения");
  
  // Сохраняем первый акт
  Capital::ProgramProperties::set_program_property_act1(coopname, property_hash, act);
  
  // Обновляем статус на act1
  Capital::ProgramProperties::update_program_property_status(coopname, property_hash, 
                                                           Capital::ProgramProperties::Status::ACT1);
};
