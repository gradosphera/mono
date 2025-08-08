/**
 * @brief Регистрация пайщика в контракте и получение договора УХД от него.
 */
void capital::regcontrib(eosio::name coopname, eosio::name application, eosio::name username, checksum256 contributor_hash, eosio::asset rate_per_hour, bool is_external_contract, document2 contract) {
  check_auth_or_fail(_capital, coopname, application, "regcontrib"_n);
  
  // если договор не внешний, то проверяем его на корректность
  if (!is_external_contract) {
    // проверяем, что договор подписан пайщиком
    verify_document_or_fail(contract, {username});
  }
  
  auto exist_by_username = Capital::Contributors::get_contributor(coopname, username);
  eosio::check(!exist_by_username.has_value(), "Пайщик уже обладает подписанным договором УХД");
  
  auto exist_by_hash = Capital::Contributors::get_contributor_by_hash(coopname, contributor_hash);
  eosio::check(!exist_by_hash.has_value(), "Контрибьютор с данным хэшем уже зарегистрирован");

  Capital::contributor_index contributors(_capital, coopname.value);
   
  contributors.emplace(coopname, [&](auto &c) {
    c.id = get_global_id_in_scope(_capital, coopname, "contributors"_n);
    c.coopname = coopname;
    c.username = username;
    c.contributor_hash = contributor_hash;
    c.status = Capital::Contributors::Status::PENDING;
    c.is_external_contract = is_external_contract;
    c.contract = contract;
    c.created_at = eosio::current_time_point();
    c.rate_per_hour = rate_per_hour;
  });
  
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