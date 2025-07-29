void capital::createinvest(name coopname, name application, name username, checksum256 project_hash, checksum256 invest_hash, asset amount, document2 statement) {
  check_auth_or_fail(_capital, coopname, application, "createinvest"_n);
  
  verify_document_or_fail(statement);
  
  check(amount.symbol == _root_govern_symbol, "Указан неверный символ токена");
  check(amount.is_valid(), "Неверный актив");
  check(amount.amount > 0, "Сумма должна быть положительной");
  
  // Проверяем основной договор УХД
  auto contributor = Capital::get_contributor(coopname, project_hash, username);
  eosio::check(contributor.has_value(), "Пайщик не подписывал основной договор УХД");
  eosio::check(contributor -> status == "authorized"_n, "Основной договор УХД не активен");
  
  // Проверяем приложение к проекту
  eosio::check(Capital::is_contributor_has_appendix_in_project(coopname, project_hash, username), 
               "Пайщик не подписывал приложение к договору УХД для данного проекта");
  
  auto exist = Capital::get_project(coopname, project_hash);
  eosio::check(exist.has_value(),"Проект не найден");
  
  Capital::project_index projects(_capital, coopname.value);
  auto project = projects.find(exist -> id);
  
  // добавляем запись в таблицу инвестиций
  Capital::invest_index invests(_capital, coopname.value);
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