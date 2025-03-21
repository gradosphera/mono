void capital::capauthwthd2(eosio::name coopname, uint64_t withdraw_id, document authorization) {
  require_auth(_soviet);
  
  capital_tables::project_withdraws_index project_withdraws(_capital, coopname.value);
  auto withdraw = project_withdraws.find(withdraw_id);
  eosio::check(withdraw != project_withdraws.end(), "Объект возврата не найден");

  auto exist_contributor = capital::get_active_contributor_or_fail(coopname, withdraw -> project_hash, withdraw -> username);
  
  contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  
  eosio::check(contributor->share_balance >= withdraw -> amount, "Недостаточно долей для уменьшения");

  contributors.modify(contributor, coopname, [&](auto &c) {
    c.returned += withdraw -> amount;
    c.share_balance -= withdraw -> amount;
  });
  
  //Уменьшение доли share_balance у пользователя и total_share_balances в проекте
  auto exist_project = get_project(coopname, withdraw -> project_hash);
  eosio::check(exist_project.has_value(), "Проект не найден");

  project_index projects(_capital, coopname.value);
  auto project = projects.find(exist_project->id);

  int64_t prev_total_shares = project -> membership_total_shares.amount;
  int64_t new_total_shares = prev_total_shares - withdraw -> amount.amount;

  eosio::check(new_total_shares >= 0, "Нельзя уменьшить total_shares ниже 0");

  // Пересчёт cumulative_reward_per_share для корректного распределения будущих выплат
  if (new_total_shares > 0) {
    projects.modify(project, coopname, [&](auto &p) {
        p.membership_cumulative_reward_per_share =
            (p.membership_cumulative_reward_per_share * prev_total_shares) / new_total_shares;
        p.membership_total_shares -= withdraw -> amount;
    });
  } else {
    // Если все доли исчезли, просто обнуляем
    projects.modify(project, coopname, [&](auto &p) {
        p.membership_cumulative_reward_per_share = 0;
        p.membership_total_shares = asset(0, _root_govern_symbol);
    });
  }
  
  std::string memo = "Зачёт части целевого паевого взноса по программе 'Капитализация' в качестве паевого взноса по участию в 'Цифровой Кошелёк' с ID: " + std::to_string(withdraw_id);
  
  // списание с капитализации
  Wallet::sub_blocked_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _capital_program, memo);
  
  // добавление в кошелёк
  Wallet::add_available_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _wallet_program, memo);
  
  // удаление возврата
  project_withdraws.erase(withdraw);
  
}