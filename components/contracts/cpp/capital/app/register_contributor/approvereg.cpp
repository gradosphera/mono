/**
 * @brief Принимает принятый председателем договор УХД и активирует вкладчика по нему
 * 
 * @param coopname Имя кооператива
 * @param contributor_hash Хэш контрибьютора
 * @param contract Договор УХД
 */
void capital::approvereg(eosio::name coopname, checksum256 contributor_hash, document2 contract) {
  name payer = check_auth_and_get_payer_or_fail(contracts_whitelist);

  verify_document_or_fail(contract);
  
  auto exist = Capital::get_contributor_by_hash(coopname, contributor_hash);
  eosio::check(exist.has_value(), "Пайщик не обладает подписанным договором УХД");
  eosio::check(exist -> status == "pending"_n, "Договор УХД должен находиться в статусе pending для приёма.");
  
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist -> id);

  eosio::check(contributor != contributors.end(), "Пайщик не зарегистрирован в контракте");

  // Обновляем пайщика и устанавливаем принятый договор УХД
  contributors.modify(contributor, coopname, [&](auto &c){
    c.status = "active"_n;
    c.contract = contract;
  });
  
  // Извлекаем кошелек для пайщика по договору УХД
  auto program_wallet = get_program_wallet(coopname, contributor -> username, _source_program);
  
  if (!program_wallet.has_value()) {
    // Открываем кошелек для пайщика для договора УХД
    action(permission_level{ _capital, "active"_n}, _soviet, "openprogwall"_n,
      std::make_tuple(coopname, contributor -> username, _source_program, uint64_t(0)))
    .send();
  };
};