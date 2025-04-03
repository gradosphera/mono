void registrator::confirmreg(eosio::name coopname, checksum256 registration_hash, document authorization)
{
  require_auth(_soviet);
  
  auto candidate = Registrator::get_candidate_by_hash(coopname, registration_hash);
  eosio::check(candidate.has_value(), "Кандидат не найден");
  
  accounts_index accounts(_registrator, _registrator.value);
  auto account = accounts.find(candidate -> username.value);
  
  //оповещаем пользователя
  require_recipient(candidate -> username);
  
  accounts.modify(account, _registrator, [&](auto &acc){
    acc.status = "active"_n;
  });
  
  eosio::time_point_sec now = current_time_point();
  
  //создаём объект пайщика
  action(
    permission_level{_registrator, "active"_n}, 
    _soviet, 
    "addpartcpnt"_n,
    std::make_tuple(
      coopname, 
      candidate -> username, 
      candidate -> braname,
      account -> type, 
      now, 
      candidate -> initial, 
      candidate -> minimum, 
      true
    )
  ).send();

  //добавляем   
  action(
    permission_level{ _registrator, "active"_n},
    _fund,
    "addcirculate"_n,
    std::make_tuple(coopname, candidate -> minimum)
  ).send();
  
  action(
    permission_level{ _registrator, "active"_n},
    _fund,
    "addinitial"_n,
    std::make_tuple(coopname, candidate -> initial)
  ).send();
}
