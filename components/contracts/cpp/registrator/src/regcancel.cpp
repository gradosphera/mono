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
