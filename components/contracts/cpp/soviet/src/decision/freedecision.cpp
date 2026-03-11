/**
 * @brief Создание свободного решения совета
 * Создает свободное решение совета без привязки к конкретному типу действия.
 * Позволяет инициировать голосование по произвольному вопросу.
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя, создающего решение
 * @param document Документ с описанием решения
 * @param meta Дополнительные метаданные
 * @ingroup public_actions
 * @ingroup public_soviet_actions

 * @note Авторизация требуется от аккаунта: @p username
 */
[[eosio::action]] void soviet::freedecision(eosio::name coopname, eosio::name username, document2 document, std::string meta) {
  
  check_auth_or_fail(_soviet, coopname, username, "freedecision"_n);
  
  // Вызываем createagenda вместо прямой записи и newsubmitted.
  // Это обеспечивает эмиссию action::soviet::createagenda для оповещения членов совета.
  action(permission_level{_soviet, "active"_n}, _soviet, "createagenda"_n,
    std::make_tuple(
      coopname,
      username,
      _free_decision_action,
      document.hash,
      _soviet,
      "freedecision"_n,
      ""_n,
      document,
      meta
    )
  ).send();
}



void soviet::freedecision_effect(eosio::name executer, eosio::name coopname, uint64_t decision_id) { 

  decisions_index decisions(_soviet, coopname.value);
  auto decision = decisions.find(decision_id);
  
  
  Action::send<newresolved_interface>(
    _soviet,
    "newresolved"_n,
    _soviet,
    coopname,
    decision -> username,
    decision -> type,
    decision -> hash.value(),
    decision -> statement
  );
  
  Action::send<newdecision_interface>(
    _soviet,
    "newdecision"_n,
    _soviet,
    coopname,
    decision -> username,
    decision -> type,
    decision -> hash.value(),
    decision -> authorization
  );


  decisions.erase(decision);

};