[[eosio::action]] void registrator::stcoopstatus(eosio::name coopname, eosio::name administrator, eosio::name status) {
    check_auth_or_fail(_registrator, _provider, administrator, "stcoopstatus"_n); //ожидаем разрешений от оператора
    
    cooperatives2_index coops(_registrator, _registrator.value);
    
    auto coop = coops.find(coopname.value);
    
    eosio::check(status == "active"_n || status == "blocked"_n || status == "pending"_n, "Недоступный статус для кооператива");
    
    eosio::check(coop != coops.end(), "Кооператив не найден");
    
    if (status == "active"_n) {
      action(
        permission_level{ _registrator, "active"_n},
        _fund,
        "init"_n,
        std::make_tuple(coopname, coop -> initial)
      ).send();
      
      if (coop -> status.value() == "pending"_n) {
        action(
          permission_level{ _registrator, "active"_n},
          _soviet,
          "newresolved"_n,
          std::make_tuple(_provider, coopname, "regcoop"_n, uint64_t(0), coop -> document.value())
        ).send();
      }
    }
    
    coops.modify(coop, administrator, [&](auto &row){ //payer is coopname should be always
      row.status = status;
    });
}

