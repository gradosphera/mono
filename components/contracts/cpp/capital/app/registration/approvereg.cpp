/**
 * @brief Добавляет подпись председателя к договору УХД
 * 
 * @param coopname 
 * @param application 
 * @param username 
 * @param approved_agreement 
 */
void capital::approvereg(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 project_hash, eosio::name username, document2 approved_agreement) {
  check_auth_or_fail(_capital, coopname, application, "approvereg"_n);
  
  verify_document_or_fail(approved_agreement);
  
  auto exist = Capital::get_contributor(coopname, project_hash, username);
  eosio::check(exist.has_value(), "Пайщик не обладает подписанным договором УХД по проекту");
  eosio::check(exist -> status == "created"_n, "Договор УХД должен находиться в статусе created для приёма.");
  
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist -> id);

  eosio::check(contributor != contributors.end(), "Пайщик не зарегистрирован в контракте");

  contributors.modify(contributor, coopname, [&](auto &c){
    c.status = "approved"_n;
    c.approved_agreement = approved_agreement;
  }); 
  
  action(permission_level{ _capital, "active"_n}, _soviet, _capital_contributor_authorize_action,
     std::make_tuple(coopname, contributor -> username, contributor -> id, contributor -> agreement, std::string("")))
  .send();
  
};