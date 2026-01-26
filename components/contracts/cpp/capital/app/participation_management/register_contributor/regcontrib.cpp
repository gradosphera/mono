/**
 * @brief Регистрация пайщика в контракте и получение договора УХД от него
 * Создает нового пайщика в системе кооператива с указанными параметрами:
 * - Проверяет уникальность пайщика по имени и хешу
 * - Валидирует договор УХД (если не внешний)
 * - Создает запись пайщика с указанной почасовой ставкой
 * - Отправляет договор на одобрение председателю
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-пайщика
 * @param contributor_hash Хеш пайщика для идентификации
 * @param rate_per_hour Почасовая ставка пайщика
 * @param is_external_contract Флаг внешнего договора
 * @param contract Договор УХД пайщика
 * @param storage_agreement Договор хранения Имущества
 * @param blagorost_agreement Соглашение о присоединении к целевой потребительской программе "Благорост" (опционально)
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::regcontrib(eosio::name coopname, eosio::name username, checksum256 contributor_hash, eosio::asset rate_per_hour, uint64_t hours_per_day, bool is_external_contract, document2 contract, document2 storage_agreement, std::optional<document2> blagorost_agreement) {
  require_auth(coopname);
  
  // если договор не внешний, то проверяем его на корректность
  if (!is_external_contract) {
    // проверяем, что договор подписан пайщиком
    verify_document_or_fail(contract, {username});
    verify_document_or_fail(storage_agreement, {username});
    if (blagorost_agreement.has_value()) {
      verify_document_or_fail(blagorost_agreement.value(), {username});
    }
  }
  
  Wallet::validate_asset(rate_per_hour);
  eosio::check(hours_per_day >= 0, "Количество часов в день должно быть неотрицательным");
  eosio::check(rate_per_hour.amount >= 0, "Ставка за час должна быть неотрицательной");
  eosio::check(rate_per_hour.amount <= 30000000, "Ставка за час должна быть не более 30000000");
  eosio::check(hours_per_day <= 12, "Количество часов в день должно быть не более 12");
  
  auto exist_by_username = Capital::Contributors::get_contributor(coopname, username);
  eosio::check(!exist_by_username.has_value(), "Пайщик уже обладает подписанным договором УХД");
  
  auto exist_by_hash = Capital::Contributors::get_contributor_by_hash(coopname, contributor_hash);
  eosio::check(!exist_by_hash.has_value(), "Контрибьютор с данным хэшем уже зарегистрирован");

  // Проверяем наличие кошелька программы Благорост
  auto blagorost_wallet = get_program_wallet(coopname, username, _capital_program);
  if (!blagorost_agreement.has_value() && !blagorost_wallet.has_value()) {
    eosio::check(false, "У пользователя нет кошелька программы Благорост и не предоставлено соглашение о присоединении к программе");
  }

  Capital::Contributors::create_contributor(coopname, username, contributor_hash, is_external_contract, contract, rate_per_hour, hours_per_day);
  
  std::string memo = "";
  
  if (is_external_contract) {
    memo += Capital::Memo::get_external_contract_memo();
  }
  
  //отправить на approve председателю
  ::Soviet::create_approval(
    _capital,
    coopname,
    username,
    contract,
    Names::Capital::REGISTER_CONTRIBUTOR,
    contributor_hash,
    _capital,
    Names::Capital::APPROVE_CONTRIBUTOR,
    Names::Capital::DECLINE_CONTRIBUTOR,
    memo
  );

  // Линковка дополнительных документов
  Action::send<newlink_interface>(
    _soviet,
    "newlink"_n,
    _capital,
    coopname,
    username,
    Names::Capital::REGISTER_CONTRIBUTOR,
    contributor_hash,
    storage_agreement
  );

  if (blagorost_agreement.has_value()) {
    Action::send<newlink_interface>(
      _soviet,
      "newlink"_n,
      _capital,
      coopname,
      username,
      Names::Capital::REGISTER_CONTRIBUTOR,
      contributor_hash,
      blagorost_agreement.value()
    );
  }

};