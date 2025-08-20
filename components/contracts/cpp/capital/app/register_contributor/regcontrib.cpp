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
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_regcontrib
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::regcontrib(eosio::name coopname, eosio::name username, checksum256 contributor_hash, eosio::asset rate_per_hour, bool is_external_contract, document2 contract) {
  require_auth(coopname);
  
  // если договор не внешний, то проверяем его на корректность
  if (!is_external_contract) {
    // проверяем, что договор подписан пайщиком
    verify_document_or_fail(contract, {username});
  }
  
  Wallet::validate_asset(rate_per_hour);
  
  auto exist_by_username = Capital::Contributors::get_contributor(coopname, username);
  eosio::check(!exist_by_username.has_value(), "Пайщик уже обладает подписанным договором УХД");
  
  auto exist_by_hash = Capital::Contributors::get_contributor_by_hash(coopname, contributor_hash);
  eosio::check(!exist_by_hash.has_value(), "Контрибьютор с данным хэшем уже зарегистрирован");

  Capital::Contributors::create_contributor(coopname, username, contributor_hash, is_external_contract, contract, rate_per_hour);
  
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

};