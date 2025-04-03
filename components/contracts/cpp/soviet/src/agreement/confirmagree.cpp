[[eosio::action]] void soviet::confirmagree(eosio::name coopname, eosio::name administrator, eosio::name username, uint64_t agreement_id) {
  check_auth_or_fail(_soviet, coopname, administrator, "confirmagree"_n);
  
  
  agreements_index agreements(_soviet, coopname.value);
  auto indoc = agreements.find(agreement_id);
  
  bool is = is_participant_of_cpp_by_program_id(coopname, username, indoc -> program_id);
  eosio::check(!is, "Участник уже принимает участие данной целевой программы");
  
  eosio::check(indoc != agreements.end(), "Документ не найден");
  eosio::check(indoc -> username == username, "Имя пользователя не соответствует документу");
  
  agreements.modify(indoc, administrator, [&](auto &d) { 
    d.status = "confirmed"_n;
  });
  
  // action(
  //   permission_level{ _soviet, "active"_n},
  //   _soviet,
  //   "newresolved"_n,
  //   std::make_tuple(coopname, username, indoc -> type, 0, indoc -> document)
  // ).send();
  
}