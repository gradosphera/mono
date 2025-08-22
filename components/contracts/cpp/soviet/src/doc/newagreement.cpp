/**
 * @brief Уведомление о новом соглашении
 * Отправляет уведомление о новом соглашении, созданном в системе.
 * Используется для информирования о новых соглашениях.
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя
 * @param type Тип соглашения
 * @param document Документ соглашения
 * @ingroup public_actions
 * @ingroup public_soviet_actions

 * @note Авторизация требуется от аккаунта в белом списке контрактов
 */
[[eosio::action]] void soviet::newagreement(NEWAGREEMENT_SIGNATURE) {
  check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  require_recipient(coopname);
  require_recipient(username);

};
