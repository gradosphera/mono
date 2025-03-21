void capital::capauthclaim(eosio::name coopname, uint64_t claim_id, document decision) {
  require_auth(_soviet);
  
  claim_index claims(_capital, coopname.value);
  auto claim = claims.find(claim_id);
  
  eosio::check(claim != claims.end(), "Объект запроса доли не найден");

  // Проверяем статус
  eosio::check(claim -> status == "statement"_n, "Неверный статус");

  auto exist = get_project(coopname, claim -> project_hash);
  eosio::check(exist.has_value(),"Проект не найден");
  project_index projects(_capital, coopname.value);
  auto project = projects.find(exist -> id);
  
  auto contributor = get_active_contributor_or_fail(coopname, claim -> project_hash, claim -> username);
  
  contributor_index contributors(_capital, coopname.value);
  auto contributor_for_modify = contributors.find(contributor -> id);
  
  contributors.modify(contributor_for_modify, coopname, [&](auto &c){
    c.converted += claim -> amount;
  });
  
  projects.modify(project, coopname, [&](auto &p) {
    p.converted += claim -> amount;
  });
  
  //Удаляем объект claim за ненадобностью
  claims.erase(claim);
  
  std::string memo = "Зачёт части целевого паевого взноса по договору УХД с ID: " + std::to_string(contributor -> id) + " в качестве паевого взноса по программе 'Цифровой Кошелёк' с ID: " + std::to_string(claim_id);
  
  //Списываем баланс средств с УХД
  Wallet::add_blocked_funds(_capital, coopname, claim -> username, claim -> amount, _source_program, memo);
  
  //Увеличиваем баланс средств в капитализации
  Wallet::add_blocked_funds(_capital, coopname, claim -> username, claim -> amount, _capital_program, memo);
};
