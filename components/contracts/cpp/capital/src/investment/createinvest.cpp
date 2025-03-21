void capital::createinvest(name coopname, name application, name username, checksum256 project_hash, checksum256 invest_hash, asset amount, document statement) {
  check_auth_or_fail(_capital, coopname, application, "createinvest"_n);
  
  verify_document_or_fail(statement);
  
  check(amount.symbol == _root_govern_symbol, "Invalid token symbol");
  check(amount.is_valid(), "Invalid asset");
  check(amount.amount > 0, "Amount must be positive");
  
  auto contributor = get_active_contributor_or_fail(coopname, project_hash, username);
  
  auto exist = get_project(coopname, project_hash);
  eosio::check(exist.has_value(),"Проект не найден");
  
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
  });
  
  std::string memo = "Зачёт части целевого паевого взноса по программе 'Цифровой Кошелёк' в качестве паевого взноса по договору УХД с ID: " + std::to_string(contributor -> id);
  
  // блокируем средства в программе кошелька
  Wallet::block_funds(_capital, coopname, contributor -> username, amount, _wallet_program, memo);
}