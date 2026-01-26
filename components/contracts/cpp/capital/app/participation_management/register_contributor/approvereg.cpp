/**
 * @brief Принимает принятый председателем договор УХД и активирует участника по нему
 * Активирует пайщика в системе кооператива после одобрения договора УХД:
 * - Проверяет подлинность договора УХД
 * - Валидирует статус пайщика (должен быть PENDING)
 * - Активирует пайщика и устанавливает принятый договор
 * - Создает программный кошелек для пайщика если необходимо
 * @param coopname Имя кооператива
 * @param username Наименование пользователя, одобрившего регистрацию
 * @param contributor_hash Хэш контрибьютора
 * @param contract Договор УХД
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от контракта совета
 */
void capital::approvereg(eosio::name coopname, eosio::name username, checksum256 contributor_hash, document2 contract) {
  name payer = check_auth_and_get_payer_or_fail(contracts_whitelist);
  verify_document_or_fail(contract);
  
  auto exist = Capital::Contributors::get_contributor_by_hash(coopname, contributor_hash);
  eosio::check(exist.has_value(), "Пайщик не обладает подписанным договором УХД");
  eosio::check(exist -> status == Capital::Contributors::Status::PENDING, "Договор УХД должен находиться в статусе pending для приёма.");
  
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist -> id);

  eosio::check(contributor != contributors.end(), "Пайщик не зарегистрирован в контракте");

  // Обновляем пайщика и устанавливаем принятый договор УХД
  contributors.modify(contributor, payer, [&](auto &c){
    c.status = Capital::Contributors::Status::ACTIVE;
    c.contract = contract;
  });
  
  // Фиксируем документ в реестре как принятый
  Soviet::make_complete_document(_capital, coopname, username, Names::Capital::APPROVE_CONTRIBUTOR, contributor_hash, contract);

  // Извлекаем кошелек для пайщика по договору УХД
  auto program_wallet = get_program_wallet(coopname, contributor -> username, _source_program);

  if (!program_wallet.has_value()) {
    // Открываем кошелек для пайщика для договора УХД
    Action::send<openprogwall_interface>(
      _soviet,
      Names::External::OPEN_PROGRAM_WALLET,
      _capital,
      coopname,
      contributor -> username,
      _source_program,
      uint64_t(0)
    );
  }

  // Проверяем наличие кошелька программы Благорост
  auto blagorost_wallet = get_program_wallet(coopname, contributor -> username, _capital_program);

  if (!blagorost_wallet.has_value()) {
    // Открываем кошелек для пайщика для программы Благорост
    Action::send<openprogwall_interface>(
      _soviet,
      Names::External::OPEN_PROGRAM_WALLET,
      _capital,
      coopname,
      contributor -> username,
      _capital_program,
      uint64_t(0)
    );
  }
};