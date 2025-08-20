/**
 * @brief Отклонение документа
 * Отклоняет документ и отправляет уведомление об отклонении.
 * Используется для информирования о непринятии документа в системе.
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя, отклоняющего документ
 * @param hash Хеш документа для отклонения
 * @param document Документ для отклонения
 * @ingroup public_actions
 * @ingroup public_soviet_actions
 * @anchor soviet_declinedoc
 * @note Авторизация требуется от аккаунта: @p username
 */
[[eosio::action]] void soviet::declinedoc(eosio::name coopname, eosio::name username, checksum256 hash, document2 document) {
  check_auth_or_fail(_soviet, coopname, username, "declinedoc"_n);

  Action::send<newdeclined_interface>(
    _soviet,
    "newdeclined"_n,
    _soviet,
    coopname,
    username,
    hash,
    document
  );
};
