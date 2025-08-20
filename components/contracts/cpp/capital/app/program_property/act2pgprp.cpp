/**
 * @brief Подписывает акт 2 по программному имущественному взносу и зачисляет в программу капитализации
 * Подписывает второй акт председателем и зачисляет имущество в программу капитализации:
 * - Проверяет что подписывает председатель
 * - Проверяет подлинность документа акта от председателя
 * - Получает предложение и валидирует его статус (должен быть act1)
 * - Сохраняет второй акт и обновляет статус на act2
 * - Начисляет заблокированные средства в кошелек программы капитализации
 * - Увеличивает паевой фонд через бухгалтерский учет
 * - Удаляет предложение после успешной обработки
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-председателя
 * @param property_hash Хеш программного имущественного взноса
 * @param act Документ акта 2
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_act2pgprp
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::act2pgprp(eosio::name coopname, eosio::name username, checksum256 property_hash, document2 act) {
  require_auth(coopname);

  auto soviet = get_board_by_type_or_fail(coopname, "soviet"_n);
  auto chairman = soviet.get_chairman();

  eosio::check(username == chairman,
               "Только председатель может принять имущество");

  // Проверяем документ
  verify_document_or_fail(act, { username });

  // Получаем предложение
  auto property = Capital::ProgramProperties::get_program_property_or_fail(coopname, property_hash);
  
  // Проверяем статус
  eosio::check(property.status == Capital::ProgramProperties::Status::ACT1, 
               "Предложение должно быть в статусе 'act1'");
  
  // Сохраняем второй акт
  Capital::ProgramProperties::set_program_property_act2(coopname, property_hash, act);
  
  // Обновляем статус на act2
  Capital::ProgramProperties::update_program_property_status(coopname, property_hash, 
                                                           Capital::ProgramProperties::Status::ACT2);
  
  std::string memo = Capital::Memo::get_program_property_memo(property_hash);
  
  // Начисляем заблокированные средства в кошелек программы капитализации
  Wallet::add_blocked_funds(_capital, coopname, property.username, property.property_amount, _capital_program, memo);
  
  // Увеличиваем паевой фонд через бухгалтерский учет
  Ledger::debet(_capital, coopname, Ledger::accounts::SHARE_FUND, property.property_amount, memo);
  
  // Удаляем предложение после успешной обработки
  Capital::ProgramProperties::delete_program_property(coopname, property_hash);
};
