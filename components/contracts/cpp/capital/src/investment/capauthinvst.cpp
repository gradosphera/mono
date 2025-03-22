/**
 * @brief Принимаем решение совета и вносим средства на кошелек пайщика при УХД
 * 
 */
void capital::capauthinvst(eosio::name coopname, uint64_t invest_id, document authorization) {
  require_auth(_soviet);

  invest_index invests(_capital, coopname.value);
  auto invest = invests.find(invest_id);
  
  eosio::check(invest != invests.end(), "Инвестиция не найдена");
  
  auto contributor = get_active_contributor_or_fail(coopname, invest -> project_hash, invest -> username);
  eosio::check(contributor.has_value(), "Договор УХД с пайщиком по проекту не найден");
  
  contributor_index contributors(_capital, coopname.value);
  auto contributor_for_modify = contributors.find(contributor -> id);
  
  contributors.modify(contributor_for_modify, coopname, [&](auto &c){
    c.invested += invest -> amount;
    c.share_balance += invest -> amount;
  });
  
  auto exist = get_project(coopname, invest -> project_hash);
  eosio::check(exist.has_value(),"Проект не найден");
  
  project_index projects(_capital, coopname.value);
  auto project = projects.find(exist -> id);
  
  projects.modify(project, coopname, [&](auto &p) {
    p.invested += invest -> amount;
    p.available += invest -> amount;
    
    // добавляем новые доли в проект
    p.membership_total_shares += invest -> amount;
  });
  
  std::string memo = "Зачёт части целевого паевого взноса по программе 'Цифровой Кошелёк' в качестве паевого взноса по договору УХД с contributor_id:" + std::to_string(contributor -> id);
  
  // списываем заблокированные средства с кошелька
  Wallet::sub_blocked_funds(_capital, coopname, contributor -> username, invest -> amount, _wallet_program, memo);
  // добавляем доступные средства в УХД
  // TODO: ???
  // списываем доступные средства с УХД
  
  // пополняем программу капитализации и блокируем средства в ней
  Wallet::add_blocked_funds(_capital, coopname, contributor -> username, invest -> amount, _capital_program, memo);
  
  // Удаляем объект за ненадобностью
  invests.erase(invest);
};