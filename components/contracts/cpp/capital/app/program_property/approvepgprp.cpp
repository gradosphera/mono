/**
 * @brief Принятие предложения по программному имущественному взносу председателем
 * \ingroup public_actions
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::approvepgprp(eosio::name coopname, checksum256 property_hash, document2 approved_statement) {
  require_auth(_soviet);

  auto soviet = get_board_by_type_or_fail(coopname, "soviet"_n);
  auto chairman = soviet.get_chairman();
  
  // Проверяем документ
  verify_document_or_fail(approved_statement, { chairman });

  // Получаем предложение
  auto property = Capital::ProgramProperties::get_program_property_or_fail(coopname, property_hash);
  
  // Проверяем статус
  eosio::check(property.status == Capital::ProgramProperties::Status::CREATED, 
               "Предложение должно быть в статусе 'created'");
  
  // Сохраняем одобренное заявление
  Capital::ProgramProperties::set_program_property_approved_statement(coopname, property_hash, approved_statement);
  
  // Обновляем статус на approved
  Capital::ProgramProperties::update_program_property_status(coopname, property_hash, 
                                                           Capital::ProgramProperties::Status::APPROVED);
  
  // Отправляем на рассмотрение совета
  ::Soviet::create_agenda(
    _capital,
    coopname,
    property.username,
    Names::Capital::CREATE_PROGRAM_PROPERTY,
    property_hash,
    _capital,
    Names::Capital::AUTHORIZE_PROGRAM_PROPERTY,
    Names::Capital::DECLINE_PROGRAM_PROPERTY,
    property.statement,
    std::string("")
  );
};
