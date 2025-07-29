namespace Capital {

  inline std::optional<progwallet> get_capital_wallet(eosio::name coopname, eosio::name username) {
    
    auto program_id = get_program_id(_capital_program);
    
    auto program = get_program_or_fail(coopname, program_id);
    
    auto capital_wallet = get_program_wallet(coopname, username, _capital_program);
    
    if (!capital_wallet.has_value()) {
      return std::nullopt;
    }
    
    return *capital_wallet;
    
  }
  

} // namespace Capital

