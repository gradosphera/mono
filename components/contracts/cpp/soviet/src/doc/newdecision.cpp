/**
 * @brief Уведомление о новом решении
 * Отправляет уведомление о новом решении, принятом в системе.
 * Используется для информирования о принятых решениях совета.
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя
 * @param type Тип решения
 * @param hash Хеш решения
 * @param authorization Документ авторизации
 * @ingroup public_actions
 * @ingroup public_soviet_actions
 * @anchor soviet_newdecision
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
[[eosio::action]] void soviet::newdecision(NEWDECISION_SIGNATURE) {
  require_auth(_soviet);

  require_recipient(coopname);
  require_recipient(username);

};
