[[eosio::action]] void branch::deletebranch(eosio::name coopname, eosio::name braname) {
  check_auth_or_fail(_branch, coopname, coopname, "deletebranch"_n);

  branch_index branches(_branch, coopname.value);
  auto branch = branches.find(braname.value);
  auto coop = get_cooperative_or_fail(coopname);

  eosio::check(branch != branches.end(), "Кооперативный участок не найден");
  
  branches.erase(branch);
  
  // отключаем участников кооператива от кооперативного участка
  action(
    permission_level{ _branch, "active"_n},
    _soviet,
    "deletebranch"_n,
    std::make_tuple(coopname, braname)
  ).send();

  uint64_t new_count = sub_branch_count(coopname);
  
  if (coop.is_branched && new_count < 3) { //отключаем систему КУ, если их меньше 3
    action(
        permission_level{ _branch, "active"_n},
        _registrator,
        "disbranches"_n,
        std::make_tuple(coopname)
      ).send();
  }
};