/**
 * @brief Принимаем решение совета и вносим средства на кошелек пайщика
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
  
  // Если есть родительский проект — там тоже отмечается часть инвестиций
  if (project -> parent_project_hash != checksum256()) {
    auto exist_parent = get_project(coopname, project->parent_project_hash);
    eosio::check(exist_parent.has_value(), "Родительский проект не найден");

    auto parent_project = projects.find(exist_parent->id);
    eosio::check(parent_project != projects.end(), "Ошибка при поиске родительского проекта");

    projects.modify(parent_project, coopname, [&](auto &p) {
        p.membership_total_shares += invest -> amount; // Родитель тоже получает доли
    });
  };

  // пополняем кошелек и блокируем средства в нём
  Wallet::add_blocked_funds(_capital, coopname, contributor -> username, invest -> amount, _cofund_program);
  
  // Удаляем объект за ненадобностью
  invests.erase(invest);
};