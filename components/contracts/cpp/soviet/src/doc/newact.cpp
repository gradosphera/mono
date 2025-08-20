/**
 * @brief Создание нового акта
 * Создает новый акт в системе кооператива.
 * Используется для документирования действий и событий.
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя
 * @param hash Хеш акта
 * @param document Документ акта
 * @ingroup public_actions
 * @ingroup public_soviet_actions
 * @anchor soviet_newact
 * @note Авторизация требуется от аккаунта в белом списке контрактов
 */
[[eosio::action]] void soviet::newact(NEWACT_SIGNATURE) {
  check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  require_recipient(coopname);
  require_recipient(username);
};
