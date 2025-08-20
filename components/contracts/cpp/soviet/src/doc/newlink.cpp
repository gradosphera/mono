/**
 * @brief Создание новой ссылки
 * Создает новую ссылку в системе кооператива.
 * Используется для связывания документов и объектов.
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя
 * @param hash Хеш ссылки
 * @param document Документ ссылки
 * @ingroup public_actions
 * @ingroup public_soviet_actions
 * @anchor soviet_newlink
 * @note Авторизация требуется от аккаунта в белом списке контрактов
 */
[[eosio::action]] void soviet::newlink(NEWLINK_SIGNATURE) {
  check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  require_recipient(coopname);
  require_recipient(username);
};
