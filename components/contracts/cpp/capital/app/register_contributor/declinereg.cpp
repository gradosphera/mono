/**
 * @brief Отклоняет председателем договор УХД и удаляет вкладчика из базы
 * 
 * @param coopname Имя кооператива
 * @param contributor_hash Хэш контрибьютора
 * @param reason Причина отклонения
 */
 void capital::declinereg(eosio::name coopname, checksum256 contributor_hash, std::string reason) {
  name payer = check_auth_and_get_payer_or_fail(contracts_whitelist);

  auto exist = Capital::Contributors::get_contributor_by_hash(coopname, contributor_hash);
  eosio::check(exist.has_value(), "Пайщик не обладает подписанным договором УХД");
  eosio::check(exist -> status == Capital::Contributors::Status::PENDING, "Договор УХД должен находиться в статусе pending для отклонения.");
  
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist -> id);

  contributors.erase(contributor);  
};