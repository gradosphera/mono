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
    