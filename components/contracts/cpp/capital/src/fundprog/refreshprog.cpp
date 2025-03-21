[[eosio::action]] void capital::refreshprog(name coopname, name application, name username) {
    check_auth_or_fail(_capital, coopname, application, "refreshprog"_n);

    // Находим участника в программе
    capital_tables::participant_index participants(_capital, coopname.value);
    auto participant = participants.find(username.value);
    
    auto state = get_global_state(coopname);
    
    // 3. Считаем дельту CRPS
    int64_t current_crps = state.program_membership_cumulative_reward_per_share;
    int64_t last_crps    = participant == participants.end() ? 0 : participant -> reward_per_share_last;
    int64_t delta        = current_crps - last_crps;

    int64_t share_balance = get_capital_user_share_balance(coopname, username);
    
    if (delta > 0 && share_balance > 0) {
      // Начисляем вознаграждение
      int64_t reward_amount_int = (share_balance * delta) / REWARD_SCALE;
      asset reward_amount = asset(reward_amount_int, _root_govern_symbol);

      if (participant == participants.end()){
        //добавляем объект учёта вознаграждений пайщика по ЦПП Капитализации
        participants.emplace(coopname, [&](auto &p){
          p.username = username;
          p.coopname = coopname;
          p.pending_rewards       = reward_amount;              
          p.reward_per_share_last  = current_crps;
        });
      } else {
        // Обновляем объект учёта вознаграждений пайщика по ЦПП Капитализации
        participants.modify(participant, coopname, [&](auto &p) {
          p.pending_rewards       += reward_amount;              
          p.reward_per_share_last  = current_crps;
        });  
      };
    };
};
