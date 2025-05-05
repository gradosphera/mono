void capital::createwthd3(name coopname, name application, name username, checksum256 project_hash, checksum256 withdraw_hash, asset amount, document2 return_statement) {
  check_auth_or_fail(_capital, coopname, application, "createwthd3"_n);

  verify_document_or_fail(return_statement);

  auto exist_project = get_project(coopname, project_hash);
  eosio::check(exist_project.has_value(), "Проект с указанным хэшем не найден");

  capital_tables::capitalist_index capitalists(_capital, coopname.value);
  auto capitalist = capitalists.find(username.value);
  eosio::check(capitalist != capitalists.end(), "Капиталист не найден");

  eosio::check(capitalist -> pending_rewards >= amount, "Недостаточно накопленных средств для создания запроса на возврат");

  int64_t share_balance = get_capital_user_share_balance(coopname, username);
  eosio::check(share_balance >= amount.amount, "Недостаточно долей для уменьшения");

  // Обновление данных капиталиста
  capitalists.modify(capitalist, coopname, [&](auto &c) {
    c.pending_rewards -= amount;
    c.returned_rewards += amount;
  });

  // Обновление глобального состояния
  auto state = get_global_state(coopname);
  auto program_share_balance = get_capital_program_share_balance(coopname);

  int64_t prev_total_shares = program_share_balance;
  int64_t new_total_shares = prev_total_shares - amount.amount;

  eosio::check(new_total_shares >= 0, "Нельзя уменьшить total_shares ниже 0");

  const int64_t PRECISION = 100000000; // 1e8 — масштаб фиксированной дроби

  if (new_total_shares > 0) {
    eosio::check(state.program_membership_cumulative_reward_per_share >= 0, "Некорректное значение reward_per_share");

    // Переводим значение в фиксированную точку
    int128_t base = static_cast<int128_t>(state.program_membership_cumulative_reward_per_share);
    int128_t scaled = base * PRECISION;
    int128_t scaled_result = (scaled * prev_total_shares) / new_total_shares;

    // Обратно в i64, округляя
    state.program_membership_cumulative_reward_per_share = static_cast<int64_t>(scaled_result / PRECISION);
  } else {
    state.program_membership_cumulative_reward_per_share = 0;
  }

  update_global_state(state);

  auto exist_withdraw = get_program_withdraw(coopname, withdraw_hash);
  eosio::check(!exist_withdraw.has_value(), "Заявка на возврат с таким хэшем уже существует");

  capital_tables::program_withdraws_index program_withdraws(_capital, coopname.value);
  
  program_withdraws.emplace(coopname, [&](auto &w) {
    w.id = get_global_id_in_scope(_capital, coopname, "withdraws3"_n);
    w.coopname = coopname;
    w.withdraw_hash = withdraw_hash;
    w.username = username;
    w.amount = amount;
    w.return_statement = return_statement;
  });
  
}