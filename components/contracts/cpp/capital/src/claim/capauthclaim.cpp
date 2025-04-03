void capital::capauthclaim(eosio::name coopname, checksum256 claim_hash, document decision) {
  require_auth(_soviet);
  
  auto exist_claim = get_claim(coopname, claim_hash);
  eosio::check(exist_claim.has_value(), "Объект запроса доли не найден");

  claim_index claims(_capital, coopname.value);
  auto claim = claims.find(exist_claim -> id);
  
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
    c.claimed += claim -> total_amount;
    c.share_balance += claim -> total_amount;
  });
  
  projects.modify(project, coopname, [&](auto &p) {
    p.claimed += claim -> total_amount;
    p.total_share_balance += claim -> total_amount;
  });
  
  std::string memo = "Зачёт части целевого паевого взноса по договору УХД с ID: " + std::to_string(contributor -> id) + " в качестве паевого взноса по программе 'Цифровой Кошелёк' с ID: " + std::to_string(claim -> id);
  
  //TODO: здесь должны гасить долг, если он есть
  
  //Увеличиваем баланс средств в капитализации
  Wallet::add_blocked_funds(_capital, coopname, claim -> username, claim -> total_amount, _capital_program, memo);
  
  //Удаляем объект claim за ненадобностью
  claims.erase(claim);
};
