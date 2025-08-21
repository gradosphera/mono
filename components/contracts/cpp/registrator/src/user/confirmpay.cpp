/**
 * @brief Подтверждение платежа регистрации.
 * Подтверждает оплату регистрационного взноса от gateway
 * @param coopname Наименование кооператива
 * @param registration_hash Хэш регистрации
 * @ingroup public_actions
 * @ingroup public_registrator_actions
 * @anchor registrator_confirmpay
 * @note Авторизация требуется от аккаунта: @p gateway
 */
void registrator::confirmpay(name coopname, checksum256 registration_hash){
  require_auth(_gateway);
  
  auto exist_candidate = Registrator::get_candidate_by_hash(coopname, registration_hash);
  
  eosio::check(exist_candidate.has_value(), "Кандидат не найден");
  
  Registrator::candidates_index candidates(_registrator, coopname.value);
  
  auto candidate = candidates.find(exist_candidate -> username.value);
  
  //TODO: coopname is payer
  candidates.modify(candidate, _registrator, [&](auto &c){
    c.status = "payed"_n;
  });
  
  action(permission_level{ _registrator, "active"_n}, _soviet, "createagenda"_n,
    std::make_tuple(
      coopname, 
      candidate -> username, 
      get_valid_soviet_action("joincoop"_n), 
      candidate -> registration_hash,
      _registrator, 
      "confirmreg"_n, 
      "declinereg"_n, 
      candidate -> statement, 
      std::string("")
    )
  ).send();  
}
