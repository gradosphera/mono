void capital::capauthwthd3(eosio::name coopname, uint64_t withdraw_id, document authorization) {
  require_auth(_soviet);
  
  capital_tables::program_withdraws_index program_withdraws(_capital, coopname.value);
  auto withdraw = program_withdraws.find(withdraw_id);
  eosio::check(withdraw != program_withdraws.end(), "Объект возврата не найден");
  
  capital_tables::participant_index participants(_capital, coopname.value);
  auto participant = participants.find(withdraw -> username.value);
  
  int64_t share_balance = get_capital_user_share_balance(coopname, withdraw -> username);
  
  eosio::check(share_balance >= withdraw -> amount.amount, "Недостаточно долей для уменьшения");

  participants.modify(participant, coopname, [&](auto &c) {
    c.returned_rewards += withdraw -> amount;
  });
  
  //Уменьшение доли share_balance у пользователя и total_share_balances в проекте
  auto state = get_global_state(coopname);
  
  //извлекаем общее количество долей всех пайщиков в капитализации
  auto program_share_balance = get_capital_program_share_balance(coopname);
  
  int64_t prev_total_shares = program_share_balance;
  int64_t new_total_shares = prev_total_shares - withdraw -> amount.amount;

  eosio::check(new_total_shares >= 0, "Нельзя уменьшить total_shares ниже 0");

  if (new_total_shares > 0) {
    state.program_membership_cumulative_reward_per_share = state.program_membership_cumulative_reward_per_share * prev_total_shares / new_total_shares;
  } else {
    state.program_membership_cumulative_reward_per_share = 0;
  }

  // обновляем глобальное состояние программы
  update_global_state(state);
  
  std::string memo = "Зачёт части целевого паевого взноса по программе 'Капитализация' в качестве паевого взноса по программе 'Цифровой Кошелёк' с ID: " + std::to_string(withdraw_id);
  
  // списание с капитализации
  Wallet::sub_blocked_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _capital_program, memo);
  
  // добавление в кошелёк
  Wallet::add_available_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _wallet_program, memo);
  
  // удаление возврата
  program_withdraws.erase(withdraw);
  
}