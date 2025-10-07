/**
 * @brief Отклоняет председателем договор УХД и удаляет вкладчика из базы
 * Отклоняет регистрацию вкладчика и удаляет его из системы кооператива:
 * - Проверяет существование вкладчика по хешу
 * - Валидирует статус вкладчика (должен быть PENDING)
 * - Удаляет вкладчика из базы данных с указанием причины
 * @param coopname Имя кооператива
 * @param username Наименование пользователя, отклонившего регистрацию
 * @param contributor_hash Хэш контрибьютора
 * @param reason Причина отклонения
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от контракта совета
 */
 void capital::declinereg(eosio::name coopname, eosio::name username, checksum256 contributor_hash, std::string reason) {
  require_auth(_soviet);

  auto exist = Capital::Contributors::get_contributor_by_hash(coopname, contributor_hash);
  eosio::check(exist.has_value(), "Пайщик не обладает подписанным договором УХД");
  eosio::check(exist -> status == Capital::Contributors::Status::PENDING, "Договор УХД должен находиться в статусе pending для отклонения.");
  
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist -> id);

  contributors.erase(contributor);  
};