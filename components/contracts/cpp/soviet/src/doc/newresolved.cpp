/**
 * @brief Уведомление о решенном документе
 * Отправляет уведомление о документе, который был решен в системе.
 * Используется для информирования о завершении обработки документов.
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя
 * @param type Тип документа
 * @param hash Хеш документа
 * @param document Документ
 * @ingroup public_actions
 * @ingroup public_soviet_actions

 * @note Авторизация требуется от аккаунта в белом списке контрактов
 */
[[eosio::action]] void soviet::newresolved(NEWRESOLVED_SIGNATURE) {
  check_auth_and_get_payer_or_fail(contracts_whitelist);

  require_recipient(coopname);
  require_recipient(username);

};
