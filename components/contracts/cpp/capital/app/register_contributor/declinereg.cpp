/**
 * @brief Отклоняет председателем договор УХД и удаляет вкладчика из базы
 * Отклоняет регистрацию вкладчика и удаляет его из системы кооператива:
 * - Проверяет существование вкладчика по хешу
 * - Валидирует статус вкладчика (должен быть PENDING)
 * - Удаляет вкладчика из базы данных с указанием причины
 * @param coopname Имя кооператива
 * @param contributor_hash Хэш контрибьютора
 * @param reason Причина отклонения
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
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