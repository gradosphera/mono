/**
\ingroup public_actions
 * @brief Создает новую запись депозита в контракте `gateway`.
 * @details Действие `dpcreate` позволяет пользователю `username` создать запись о депозите 
 * в указанном кооперативе по имени аккаунта `coopname` с определенными параметрами. 
 * 
 * @note Требуется авторизация пользователя `username`.
 *
 * @param username Имя пользователя, создающего запись.
 * @param coopname Имя аккаунта кооператива, в рамках которого создается депозит.
 * @param program_id Идентификатор программы, с которой связан депозит.
 * @param purpose Назначение платежа ('registration' или 'deposit').
 * @param batch_id Вторичный идентификатор, связанный с депозитом.
 * @param internal_quantity Количество во внутреннем формате.
 * @param external_quantity Количество во внешнем формате.
 * @param memo Примечание к депозиту.
 *
 * Пример создания новой записи депозита через cleos:
 * 
 * cleos push action gateway dpcreate '["username", "coopaccount", 123, "registration", 456, "10.0000 SYS", "10.0000 EXT", "Депозит для программы X"]' -p username@active
 */

[[eosio::action]] void gateway::deposit(eosio::name coopname, eosio::name username, uint64_t deposit_id, eosio::name type, eosio::asset quantity) {
  // TODO убрать пользователя здесь, перевести на выдачу разрешений специальному аккаунту от кооператива для обслуживания депозитов. 
  // @todo добавить специальное разрешение
  // Пользователь сам может вызвать, но ордер на оплату формируется с бэкенда и никаких ссылок здесь в процессе не фигурирует - только статус, который может быть изменен только бэкендом. 
  eosio::name payer = has_auth(coopname) ? coopname : username;
  
  eosio::check(has_auth(payer), "Недостаточно прав доступа");

  deposits_index deposits(_gateway, coopname.value);

  auto cooperative = get_cooperative_or_fail(coopname);
  
  eosio::check(type == "registration"_n || type == "deposit"_n, "Неверный тип заявки");
  eosio::check(quantity.amount > 0, "Сумма ввода должна быть положительной");

  if (type == "deposit"_n) {
    participants_index participants(_soviet, coopname.value);
    auto participant = get_participant_or_fail(coopname, username);
  } else { //registration
    eosio::check(quantity == cooperative.registration || quantity == cooperative.org_registration.value(), "Сумма минимального взноса не соответствует установленной в кооперативе");
  }

  deposits.emplace(payer, [&](auto &d) {
    d.id = deposit_id;
    d.type = type;
    d.username = username;
    d.coopname = coopname;
    d.quantity = quantity;
    d.status = "pending"_n;
    d.expired_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + _deposit_expiration_seconds);
  });

}

/**
 * @brief Завершает обработку депозита в контракте `gateway`.
 *
 * @details Действие `dpcomplete` используется для установки статуса депозита в 'completed' и обновления его заметки.
 * Это действие также инициирует выпуск токенов соответствующему пользователю, основываясь на данных депозита.
 *
 * @note Требуется авторизация аккаунта контракта `gateway`.
 * @ingroup public_actions
 *
 * @param deposit_id Идентификатор депозита, который завершается.
 * @param memo Новая заметка, связанная с депозитом.
 *
 * Завершение обработки депозита через cleos
 *
 * cleos push action gateway dpcomplete '[123, "Заметка к завершенному депозиту"]' -p gateway@active
 */
void gateway::dpcomplete(eosio::name coopname, eosio::name admin, uint64_t deposit_id, std::string memo) {

  require_auth(admin);

  if (coopname != admin) {
    check_auth_or_fail(_gateway, coopname, admin, "dpcomplete"_n);
  };

  deposits_index deposits(_gateway, coopname.value);
  auto deposit = deposits.find(deposit_id);

  eosio::check(deposit != deposits.end(), "Объект процессинга не найден");
  eosio::check(deposit -> coopname == coopname, "Указан не верный кооператив");
  eosio::check(deposit -> status == "pending"_n, "Статус депозита должен быть pending");

  auto cooperative = get_cooperative_or_fail(coopname);  
  cooperative.check_symbol_or_fail(deposit -> quantity);

  deposits.modify(deposit, admin, [&](auto &d){
    d.status = "completed"_n;
    d.expired_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + _deposit_expiration_seconds);
  });
  

  if (deposit -> type == "deposit"_n) {
    //проверяем пайщика на членство и активность
    auto participant = get_participant_or_fail(coopname, deposit -> username);
  
    action(
      permission_level{ _gateway, "active"_n},
      _gateway,
      "newdeposit"_n,
      std::make_tuple(coopname, deposit -> username, deposit_id, deposit->type, deposit -> quantity, eosio::current_time_point())
    ).send();
  
    action(
      permission_level{ _gateway, "active"_n},
      _soviet,
      "addbal"_n,
      std::make_tuple(coopname, deposit -> username, _wallet_program_id, deposit -> quantity, std::string("Паевой взнос в ЦПП 'Цифровой Кошелёк'"))
    ).send();
    
    action(
      permission_level{ _gateway, "active"_n},
      _fund,
      "addcirculate"_n,
      std::make_tuple(coopname, deposit -> quantity)
    ).send();
  
  } else {
    //TODO spread to funds
    eosio::asset to_circulation = deposit -> quantity == cooperative.registration ? cooperative.minimum : cooperative.org_minimum.value();
    eosio::asset to_spread = deposit -> quantity == cooperative.registration ? cooperative.initial : cooperative.org_initial.value();

    action(
      permission_level{ _gateway, "active"_n},
      _gateway,
      "adduser"_n,
      std::make_tuple(coopname, deposit->username, to_spread, to_circulation, eosio::current_time_point(), true)
    ).send();

    action(
      permission_level{ _gateway, "active"_n},
      _soviet,
      "regpaid"_n,
      std::make_tuple(coopname, deposit -> username)
    ).send();
    
  }
}

/**
 * @brief Construct a new dprefund object
 * 
 * @param coopname 
 * @param admin 
 * @param deposit_id 
 * @param memo 
 */
void gateway::dprefund(eosio::name coopname, eosio::name admin, uint64_t deposit_id, std::string memo) {
  check_auth_or_fail(_gateway, coopname, admin, "dprefund"_n);
  
  auto cooperative = get_cooperative_or_fail(coopname);  
  
  deposits_index deposits(_gateway, coopname.value);
  auto deposit = deposits.find(deposit_id);
  eosio::check(deposit != deposits.end(), "Объект процессинга не найден");
  
  eosio::check(deposit -> status == "completed"_n, "Только объекты платежа в статусе completed могут быть возвращены");
  
  if (deposit -> type == "deposit"_n) {
    action(
      permission_level{ _gateway, "active"_n},
      _soviet,
      "subbal"_n,
      std::make_tuple(coopname, deposit -> username, _wallet_program_id, deposit -> quantity, true, "Отмена паевого взноса в ЦПП 'Цифровой Кошелёк'")
    ).send();
    
    action(
      permission_level{ _gateway, "active"_n},
      _fund,
      "subcirculate"_n,
      std::make_tuple(coopname, deposit -> quantity, true)
    ).send();
  
  } else {
    // отправляем сигнал на отмену регистрации

    eosio::asset minimum = deposit -> quantity == cooperative.registration ? cooperative.minimum : cooperative.org_minimum.value();
    eosio::asset initial = deposit -> quantity == cooperative.registration ? cooperative.initial : cooperative.org_initial.value();

    action(
      permission_level{ _gateway, "active"_n},
      _fund,
      "subcirculate"_n,
      std::make_tuple(coopname, minimum, true)
    ).send();
    
    //вычесть вступительную сумму из фонда
    action(
      permission_level{ _gateway, "active"_n},
      _fund,
      "subinitial"_n,
      std::make_tuple(coopname, initial)
    ).send();
    
    action (
      permission_level{ _gateway, "active"_n},
      _soviet,
      "cancelreg"_n,
      std::make_tuple(coopname, deposit -> username, memo)
    ).send();
    
  };
  
  //удаляем объект депозита
  deposits.erase(deposit); 

};

