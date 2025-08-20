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
 * @anchor soviet_freedecision
 * @note Авторизация требуется от аккаунта: @p username
 */
[[eosio::action]] void soviet::freedecision(eosio::name coopname, eosio::name username, document2 document, std::string meta) {
  
  check_auth_or_fail(_soviet, coopname, username, "freedecision"_n);
  
  decisions_index decisions(_soviet, coopname.value);
  
  auto decision_id = get_id(_soviet, coopname, "decisions"_n);
  checksum256 decision_hash = eosio::sha256((char*)&decision_id, sizeof(decision_id));
  
  decisions.emplace(_soviet, [&](auto &d){
    d.id = decision_id;
    d.coopname = coopname;
    d.username = username;
    d.type = _free_decision_action;
    d.batch_id = 0;
    d.statement = document;
    d.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
    d.expired_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + _decision_expiration);
    d.meta = meta;
    d.hash = decision_hash;
  });
  
  
  Action::send<newsubmitted_interface>(
    _soviet,
    "newsubmitted"_n,
    _soviet,
    coopname,
    username,
    "freedecision"_n,
    decision_hash,
    document
  );
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