/**
 * @brief Уведомление об отклоненном документе
 * Отправляет уведомление о документе, который был отклонен в системе.
 * Используется для информирования об отклонении документов.
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя
 * @param hash Хеш документа
 * @param document Документ
 * @ingroup public_actions
 * @ingroup public_soviet_actions
 * @anchor soviet_newdeclined
 * @note Авторизация требуется от аккаунта в белом списке контрактов
 */
[[eosio::action]] void soviet::newdeclined(NEWDECLINED_SIGNATURE) {
  check_auth_and_get_payer_or_fail(contracts_whitelist);

  require_recipient(coopname);
  require_recipient(username);

};
