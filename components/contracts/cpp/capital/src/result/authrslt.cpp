void capital::authrslt(eosio::name coopname, checksum256 result_hash, document decision) {
  require_auth(_soviet);
  
  auto exist_result = get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Объект запроса доли не найден");

  result_index results(_capital, coopname.value);
  auto result = results.find(exist_result -> id);
  
  // Проверяем статус
  eosio::check(result -> status == "statement"_n, "Неверный статус");

  auto exist = get_project(coopname, result -> project_hash);
  eosio::check(exist.has_value(),"Проект не найден");
  project_index projects(_capital, coopname.value);
  auto project = projects.find(exist -> id);
  
  auto contributor = get_active_contributor_or_fail(coopname, result -> project_hash, result -> username);
  
  contributor_index contributors(_capital, coopname.value);
  auto contributor_for_modify = contributors.find(contributor -> id);
  
  contributors.modify(contributor_for_modify, coopname, [&](auto &c){
    c.resulted += result -> total_amount;
    c.share_balance += result -> total_amount;
  });
  
  projects.modify(project, coopname, [&](auto &p) {
    p.resulted += result -> total_amount;
    p.total_share_balance += result -> total_amount;
  });
  
  std::string memo = "Зачёт части целевого паевого взноса по договору УХД с ID: " + std::to_string(contributor -> id) + " в качестве паевого взноса по программе 'Цифровой Кошелёк' с ID: " + std::to_string(result -> id);
  
  //TODO: здесь должны гасить долг, если он есть
  
  //Увеличиваем баланс средств в капитализации
  Wallet::add_blocked_funds(_capital, coopname, result -> username, result -> total_amount, _capital_program, memo);
  
  //Удаляем объект result за ненадобностью
  results.erase(result);
};
