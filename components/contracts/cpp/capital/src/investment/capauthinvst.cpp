/**
 * @brief Принимаем решение совета и вносим средства на кошелек пайщика при УХД
 * 
 */
void capital::capauthinvst(eosio::name coopname, checksum256 invest_hash, document2 authorization) {
  require_auth(_soviet);
  
  auto exist_invest = get_invest(coopname, invest_hash);
  eosio::check(exist_invest.has_value(), "Инвестиция не найдена");
  
  invest_index invests(_capital, coopname.value);
  auto invest = invests.find(exist_invest -> id);
    
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
    p.total_share_balance += invest -> amount;
  });
  
  // Начисляем 4% ТОЛЬКО тому координатору, который привел инвестора согласно ТЗ БЛАГОРОСТ v0.1
  // С учетом лимита накоплений 100,000 RUB и только если еще не подавалась презентация
  if (invest -> coordinator_username != name()) {
    // Проверяем, не подавал ли координатор уже презентацию за этого инвестора
    bool already_claimed = has_coordinator_received_payout(coopname, invest -> coordinator_username, invest -> username);
    
    if (!already_claimed) {
      // Получаем уже накопленную сумму за этого инвестора
      eosio::asset accumulated = get_coordinator_accumulated_amount(coopname, invest -> coordinator_username, invest -> username);
      
      // Проверяем, не превышен ли лимит накоплений
      if (accumulated.amount < MAX_COORDINATOR_ACCUMULATION) {
        coordinator_index coordinators(_capital, coopname.value);
        auto project_coord_index = coordinators.get_index<"byprojcoord"_n>();
        
        uint128_t combined_id = combine_checksum_ids(invest -> project_hash, invest -> coordinator_username);
        auto coord_itr = project_coord_index.find(combined_id);
        
        if (coord_itr != project_coord_index.end() && coord_itr->status == "active"_n) {
          // Рассчитываем 4% от инвестиции
          eosio::asset coordinator_earning = eosio::asset(
              int64_t(static_cast<double>(invest -> amount.amount) * COORDINATOR_PERCENT),
              invest -> amount.symbol
          );
          
          // Проверяем, не превысит ли новое начисление лимит
          eosio::asset new_total = accumulated + coordinator_earning;
          if (new_total.amount > MAX_COORDINATOR_ACCUMULATION) {
            // Ограничиваем начисление до лимита
            coordinator_earning = eosio::asset(MAX_COORDINATOR_ACCUMULATION - accumulated.amount, invest -> amount.symbol);
          }
          
          // Начисляем только если есть что начислить
          if (coordinator_earning.amount > 0) {
            project_coord_index.modify(coord_itr, coopname, [&](auto &c) {
                // Добавляем в pending_coordinator_base - это будет учтено при сдаче результата
                c.pending_coordinator_base += coordinator_earning;
            });
          }
        }
      }
    }
  }
  
  std::string memo = "Зачёт части целевого паевого взноса по программе 'Цифровой Кошелёк' в качестве паевого взноса по договору УХД с contributor_id:" + std::to_string(contributor -> id);
  
  // списываем заблокированные средства с кошелька
  Wallet::sub_blocked_funds(_capital, coopname, contributor -> username, invest -> amount, _wallet_program, memo);
  
  // пополняем программу капитализации и блокируем средства в ней
  Wallet::add_blocked_funds(_capital, coopname, contributor -> username, invest -> amount, _capital_program, memo);
  
  // Удаляем объект за ненадобностью
  invests.erase(invest);
};