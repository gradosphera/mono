[[eosio::action]] void capital::refreshprog(name coopname, name application, name username) {
    check_auth_or_fail(_capital, coopname, application, "refreshprog"_n);

    // Находим капиталиста в программе
    capital_tables::capitalist_index capitalists(_capital, coopname.value);
    auto capitalist = capitalists.find(username.value);
    
    auto state = get_global_state(coopname);
    
    // 3. Считаем дельту CRPS
    int64_t current_crps = state.program_membership_cumulative_reward_per_share;
    int64_t last_crps    = capitalist == capitalists.end() ? 0 : capitalist -> reward_per_share_last;
    int64_t delta        = current_crps - last_crps;

    int64_t share_balance = get_capital_user_share_balance(coopname, username);
    
    if (delta > 0 && share_balance > 0) {
      // Начисляем вознаграждение
      int64_t reward_amount_int = (share_balance * delta) / REWARD_SCALE;
      asset reward_amount = asset(reward_amount_int, _root_govern_symbol);
      
      if (capitalist == capitalists.end()){
        capitalists.emplace(coopname, [&](auto &p){
          p.username = username;
          p.coopname = coopname;
          p.pending_rewards       = reward_amount;              
          p.reward_per_share_last  = current_crps;
        });
      } else {
        capitalists.modify(capitalist, coopname, [&](auto &p) {
          p.pending_rewards       += reward_amount;              
          p.reward_per_share_last  = current_crps;
        });  
      };
    };
};
