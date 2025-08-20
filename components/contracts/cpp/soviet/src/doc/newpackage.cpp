/**
 * @brief Уведомление о новом пакете документов
 * Отправляет уведомление о новом пакете документов, созданном в системе.
 * Используется для информирования о пакетах документов.
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя
 * @param type Тип пакета
 * @param hash Хеш пакета
 * @param document Документ пакета
 * @ingroup public_actions
 * @ingroup public_soviet_actions
 * @anchor soviet_newpackage
 * @note Авторизация требуется от аккаунта в белом списке контрактов
 */
[[eosio::action]] void soviet::newpackage(NEWPACKAGE_SIGNATURE) {
  check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  require_recipient(coopname);
  require_recipient(username);

};
