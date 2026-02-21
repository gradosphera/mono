/**
 * @brief Отмена истекшего решения
 * Отменяет решение совета по истечении срока его действия.
 * Отправляет обратный вызов об отклонении и удаляет решение из системы.
 * @param coopname Наименование кооператива
 * @param decision_id Идентификатор решения для отмены
 * @ingroup public_actions
 * @ingroup public_soviet_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void soviet::cancelexprd(eosio::name coopname, uint64_t decision_id) { 
  require_auth(coopname);

  decisions_index decisions(_soviet, coopname.value);
  auto decision = decisions.find(decision_id);
  eosio::check(decision != decisions.end(), "Решение не найдено");
  
  // Проверка истечения срока
  bool expired = true;
  if ( decision -> expired_at.has_value() ) {
    expired = (eosio::time_point_sec(eosio::current_time_point()) > decision->expired_at.value());
  }
  
  eosio::check(expired, "Срок действия решения ещё не истёк");
  
  // Проверка наличия всех необходимых полей для отправки коллбэка
  if (decision->callback_contract.has_value() && 
      decision->decline_callback.has_value() && 
      decision->hash.has_value() && 
      decision->callback_contract.value() != ""_n && 
      decision->confirm_callback.value() != ""_n && 
      decision->decline_callback.value() != ""_n
    ) {
    
    // Отправка коллбэка отклонения
    Action::send<decline_callback_interface>(
      decision->callback_contract.value(),
      //TODO: delete it
      decision->decline_callback.value() == "declagm"_n ? "declmeet"_n : decision->decline_callback.value(),
      _soviet,
      coopname,
      decision->hash.value(),
      std::string("Отклонение по истечению срока")
    );
  }
  
  // Удаление решения
  decisions.erase(decision);
}