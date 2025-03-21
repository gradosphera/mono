void capital::fundprog(eosio::name coopname, asset amount, std::string memo) {
    auto payer = check_auth_and_get_payer_or_fail({_soviet, _gateway});

    Wallet::validate_asset(amount);

    int64_t membership_total_shares = get_capital_program_share_balance(coopname);
        
    auto state = get_global_state(coopname);
    
    state.program_membership_funded += amount; 
    state.program_membership_available += amount;
    
    if (membership_total_shares > 0) {
      // REWARD_SCALE - ваш масштаб (например, 1e8), чтобы не терять точность
      int64_t delta = (amount.amount * REWARD_SCALE) / membership_total_shares;
      state.program_membership_cumulative_reward_per_share += delta;
    };

    update_global_state(state);
};
