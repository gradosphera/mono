void capital::createwthd2(name coopname, name application, name username, checksum256 project_hash, checksum256 withdraw_hash, asset amount, document2 return_statement) {
  check_auth_or_fail(_capital, coopname, application, "createwthd2"_n);

  verify_document_or_fail(return_statement);

  auto exist_project = get_project(coopname, project_hash);
  eosio::check(exist_project.has_value(), "Проект с указанным хэшем не найден");

  // Проверяем основной договор УХД
  auto exist_contributor = get_contributor(coopname, project_hash, username);
  eosio::check(exist_contributor.has_value(), "Пайщик не подписывал основной договор УХД");
  eosio::check(exist_contributor -> status == "authorized"_n, "Основной договор УХД не активен");
  
  // Проверяем приложение к проекту
  eosio::check(is_contributor_has_appendix_in_project(coopname, project_hash, username), 
               "Пайщик не подписывал приложение к договору УХД для данного проекта");
  eosio::check(exist_contributor -> pending_rewards >= amount, "Недостаточно накопленных средств для создания запроса на возврат");

  contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);

  eosio::check(contributor->share_balance >= amount, "Недостаточно долей для уменьшения");

  // Обновление долей
  contributors.modify(contributor, coopname, [&](auto &c) {
    c.pending_rewards -= amount;
    c.returned += amount;
    c.share_balance -= amount;
  });

  // Обновление проекта
  project_index projects(_capital, coopname.value);
  auto project = projects.find(exist_project->id);

  int64_t prev_total_shares = project->total_share_balance.amount;
  int64_t new_total_shares = prev_total_shares - amount.amount;
  eosio::check(new_total_shares >= 0, "Нельзя уменьшить total_shares ниже 0");

  if (new_total_shares > 0) {
    projects.modify(project, coopname, [&](auto &p) {
      p.membership_cumulative_reward_per_share = (p.membership_cumulative_reward_per_share * prev_total_shares) / new_total_shares;
      p.total_share_balance -= amount;
    });
  } else {
    projects.modify(project, coopname, [&](auto &p) {
      p.membership_cumulative_reward_per_share = 0;
      p.total_share_balance = asset(0, _root_govern_symbol);
    });
  }

  // Запись возврата
  auto exist_withdraw = get_project_withdraw(coopname, withdraw_hash);
  eosio::check(!exist_withdraw.has_value(), "Заявка на взнос-возврат с таким хэшем уже существует");

  capital_tables::project_withdraws_index project_withdraws(_capital, coopname.value);
  project_withdraws.emplace(coopname, [&](auto &w) {
    w.id = get_global_id_in_scope(_capital, coopname, "withdraws2"_n);
    w.coopname = coopname;
    w.withdraw_hash = withdraw_hash;
    w.project_hash = project_hash;
    w.username = username;
    w.amount = amount;
    w.return_statement = return_statement;
  });
}