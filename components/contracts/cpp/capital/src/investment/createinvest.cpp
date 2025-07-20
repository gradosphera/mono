void capital::createinvest(name coopname, name application, name username, checksum256 project_hash, checksum256 invest_hash, asset amount, document2 statement) {
  check_auth_or_fail(_capital, coopname, application, "createinvest"_n);
  
  verify_document_or_fail(statement);
  
  check(amount.symbol == _root_govern_symbol, "Invalid token symbol");
  check(amount.is_valid(), "Invalid asset");
  check(amount.amount > 0, "Amount must be positive");
  
  auto contributor = get_active_contributor_or_fail(coopname, project_hash, username);
  
  auto exist = get_project(coopname, project_hash);
  eosio::check(exist.has_value(),"Проект не найден");
  
  // Автоматически определяем координатора по referer из таблицы accounts
  eosio::name coordinator_username;
  
  // Получаем информацию об аккаунте инвестора из контракта registrator
  accounts_index accounts(_registrator, _registrator.value);
  auto account_itr = accounts.find(username.value);
  
  if (account_itr != accounts.end() && account_itr->referer != name()) {
    // Проверяем что referer является участником проекта (имеет договор УХД)
    auto referer_contributor = get_contributor(coopname, project_hash, account_itr->referer);
    
    if (referer_contributor.has_value() && referer_contributor->status == "authorized"_n) {
      coordinator_username = account_itr->referer;
      
      // Автоматически добавляем координатора, если его еще нет
      auto existing_coordinator = get_coordinator(coopname, project_hash, coordinator_username);
      if (!existing_coordinator.has_value()) {
        coordinator_index coordinators(_capital, coopname.value);
        auto coordinator_id = get_global_id_in_scope(_capital, coopname, "coordinators"_n);
        
        coordinators.emplace(coopname, [&](auto &c) {
          c.id = coordinator_id;
          c.project_hash = project_hash;
          c.username = coordinator_username;
          c.status = "active"_n;
          c.pending_coordinator_base = asset(0, _root_govern_symbol);
          c.coordinator_base = asset(0, _root_govern_symbol);
          c.earned = asset(0, _root_govern_symbol);
          c.withdrawed = asset(0, _root_govern_symbol);
          c.assigned_at = current_time_point();
        });
      }
    }
  }
  
  project_index projects(_capital, coopname.value);
  auto project = projects.find(exist -> id);
  
  // добавляем запись в таблицу инвестиций
  invest_index invests(_capital, coopname.value);
  uint64_t invest_id = get_global_id_in_scope(_capital, coopname, "invests"_n);
  
  invests.emplace(coopname, [&](auto &i){
    i.id = invest_id;
    i.coopname = coopname;
    i.application = application;
    i.username = username;
    i.project_hash = project_hash;
    i.invest_hash = invest_hash;
    i.status = "created"_n;
    i.invested_at = current_time_point();
    i.invest_statement = statement;
    i.amount = amount;
    i.coordinator_username = coordinator_username; // Автоматически определенный координатор
  });
  
  std::string memo = "Зачёт части целевого паевого взноса по программе 'Цифровой Кошелёк' в качестве паевого взноса по договору УХД с ID: " + std::to_string(contributor -> id);
  
  // блокируем средства в программе кошелька
  Wallet::block_funds(_capital, coopname, contributor -> username, amount, _wallet_program, memo);
};