namespace Wallet {
  
  inline void validate_asset(const eosio::asset& amount) {
    check(amount.symbol == _root_govern_symbol, "Invalid token symbol");
    check(amount.is_valid(), "Invalid asset");
    check(amount.amount > 0, "Amount must be positive");
  }
  
  inline void add_available_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type) {
      auto program = get_program_or_fail(coopname, get_program_id(program_type));

      action(
          permission_level{ contract, "active"_n },
          _soviet,
          "addbal"_n,
          std::make_tuple(coopname, username, program.id, amount)
      ).send();

  }
  
  inline void sub_available_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type) {
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "subbal"_n,
        std::make_tuple(coopname, username, program.id, amount, false)
    ).send();
  }

  inline void add_blocked_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type) {
      auto program = get_program_or_fail(coopname, get_program_id(program_type));

      action(
          permission_level{ contract, "active"_n },
          _soviet,
          "addbal"_n,
          std::make_tuple(coopname, username, program.id, amount)
      ).send();

      action(
          permission_level{ contract, "active"_n },
          _soviet,
          "blockbal"_n,
          std::make_tuple(coopname, username, program.id, amount)
      ).send();
  }
  
  inline void sub_blocked_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type) {
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "unblockbal"_n,
        std::make_tuple(coopname, username, program.id, amount)
    ).send();

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "subbal"_n,
        std::make_tuple(coopname, username, program.id, amount, false)
    ).send();
  }
  
  inline void block_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type){
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "blockbal"_n,
        std::make_tuple(coopname, username, program.id, amount)
    ).send();
  }
  
  inline void unblock_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type){
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "unblockbal"_n,
        std::make_tuple(coopname, username, program.id, amount)
    ).send();
  }
}