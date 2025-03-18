void capital::setact2(eosio::name coopname, eosio::name application, eosio::name owner, checksum256 claim_hash, document act) {
  check_auth_or_fail(_capital, coopname, application, "setact2"_n);

  verify_document_or_fail(act);
  
  auto exist_claim = get_claim(coopname, claim_hash);

  eosio::check(exist_claim.has_value(), "Объект запроса доли не найден");
  eosio::check(exist_claim -> owner == owner, "Неверно указано имя пользователя владельца результата");
  
  auto result = get_result(coopname, exist_claim -> result_hash);
  eosio::check(result.has_value(), "Результат не найден");
    
  auto project = get_project(coopname, result -> project_hash);
  eosio::check(project.has_value(), "Проект не найден");
  
  // Проверяем статус
  eosio::check(exist_claim -> status == "act1"_n, "Неверный статус для поставки акта");
  
  claim_index claims(coopname, coopname.value);
  auto claim = claims.find(exist_claim -> id);
  
  claims.modify(claim, coopname, [&](auto &n) {
    n.status = "act2"_n;
    n.act2 = act;
  });
  
  auto contributor = capital::get_active_contributor_or_fail(coopname, result -> project_hash, exist_claim -> owner);
  contributor_index contributors(_capital, coopname.value);
    
  auto contributor_for_modify = contributors.find(contributor -> id);
  
  // Увеличиваем share_balance на сумму остатка создательского баланса
  contributors.modify(contributor_for_modify, coopname, [&](auto &c) {
    c.share_balance += claim -> amount;
  });
  
  project_index projects(_capital, coopname.value);
  auto project_for_modify = projects.find(project -> id);
  
  // учитываем увеличение долей в проекте
  projects.modify(project_for_modify, coopname, [&](auto &p){
    p.membership_total_shares +=  claim -> amount;
  });
  
  // списание с УХД
  Wallet::sub_blocked_funds(_capital, coopname, claim -> owner, claim -> amount, _cofund_program);

  // добавление на капитализацию
  Wallet::add_blocked_funds(_capital, coopname, claim -> owner, claim -> amount, _capital_program);
  
};
