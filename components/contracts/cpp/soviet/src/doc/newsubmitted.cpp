/**
 * @brief Уведомление о новом представленном документе
 * Отправляет уведомление о новом документе, представленном в систему.
 * Используется для информирования о поступлении документов.
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя
 * @param type Тип документа
 * @param hash Хеш документа
 * @param document Документ
 * @ingroup public_actions
 * @ingroup public_soviet_actions
 * @anchor soviet_newsubmitted
 * @note Авторизация требуется от аккаунта в белом списке контрактов
 */
[[eosio::action]] void soviet::newsubmitted(NEWSUBMITTED_SIGNATURE) {
  check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  require_recipient(coopname);
  require_recipient(username);

};
