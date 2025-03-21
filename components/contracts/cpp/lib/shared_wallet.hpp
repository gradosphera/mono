namespace Wallet {
  
  inline void validate_asset(const eosio::asset& amount) {
    check(amount.symbol == _root_govern_symbol, "Invalid token symbol");
    check(amount.is_valid(), "Invalid asset");
    check(amount.amount > 0, "Amount must be positive");
  }
  
  inline void add_available_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type, std::string memo) {
      auto program = get_program_or_fail(coopname, get_program_id(program_type));

      action(
          permission_level{ contract, "active"_n },
          _soviet,
          "addbal"_n,
          std::make_tuple(coopname, username, program.id, amount, memo)
      ).send();

  }
  
  inline void sub_available_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type, std::string memo) {
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "subbal"_n,
        std::make_tuple(coopname, username, program.id, amount, false, memo)
    ).send();
  }

  inline void add_blocked_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type, std::string memo) {
      auto program = get_program_or_fail(coopname, get_program_id(program_type));

      action(
          permission_level{ contract, "active"_n },
          _soviet,
          "addbal"_n,
          std::make_tuple(coopname, username, program.id, amount, memo)
      ).send();

      action(
          permission_level{ contract, "active"_n },
          _soviet,
          "blockbal"_n,
          std::make_tuple(coopname, username, program.id, amount, memo)
      ).send();
  }
  
  inline void sub_blocked_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type, std::string memo) {
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "unblockbal"_n,
        std::make_tuple(coopname, username, program.id, amount, memo)
    ).send();

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "subbal"_n,
        std::make_tuple(coopname, username, program.id, amount, false, memo)
    ).send();
  }
  
  inline void block_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type, std::string memo){
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "blockbal"_n,
        std::make_tuple(coopname, username, program.id, amount, memo)
    ).send();
  }
  
  inline void unblock_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type, std::string memo){
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "unblockbal"_n,
        std::make_tuple(coopname, username, program.id, amount, memo)
    ).send();
  }
  
  inline void pay_membership_fee(name contract, name coopname, name username, name amount, eosio::name program_type, std::string memo) {
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "subbal"_n,
        std::make_tuple(coopname, username, program.id, amount, false, memo)
    ).send();
    
    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "addmemberfee"_n,
        std::make_tuple(coopname, username, program.id, amount, memo)
    ).send();    
    
  }
}