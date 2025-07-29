/**
 * @brief Получение накопленных средств координатором при сдаче результата согласно ТЗ БЛАГОРОСТ v0.1
 * Координатор предоставляет презентацию о приведенных инвесторах и получает накопленные 4%
 * Максимум 100,000 RUB за каждого инвестора, выплата только один раз
 */
void capital::claimcoordntr(name coopname, name application, checksum256 project_hash, checksum256 result_hash, name coordinator, document2 presentation) {
    require_auth(coordinator);
    
    verify_document_or_fail(presentation);
    
    // Получаем координатора
    auto coord = get_coordinator_or_fail(coopname, project_hash, coordinator, "Координатор не найден");
    
    // Проверяем что у координатора есть накопленные средства
    eosio::check(coord.pending_coordinator_base.amount > 0, "Нет накопленных средств для получения");
    
    // Найдем все инвестиции координатора для записи выплат
    Capital::invest_index invests(_capital, coopname.value);
    auto coordinator_invest_index = invests.get_index<"bycoordntr"_n>();
    
    auto lower = coordinator_invest_index.lower_bound(coordinator.value);
    auto upper = coordinator_invest_index.upper_bound(coordinator.value);
    
    // Вычисляем общую накопленную сумму по каждому инвестору
    std::map<eosio::name, eosio::asset> investor_accumulations;
    
    for (auto invest_itr = lower; invest_itr != upper; ++invest_itr) {
        if (invest_itr->project_hash == project_hash) {
            eosio::name investor = invest_itr->username;
            
            // Проверяем, не подавал ли уже координатор презентацию за этого инвестора
            bool already_claimed = has_coordinator_received_payout(coopname, coordinator, investor);
            
            if (!already_claimed) {
                // Рассчитываем 4% от инвестиции
                eosio::asset coordinator_earning = eosio::asset(
                    int64_t(static_cast<double>(invest_itr->amount.amount) * COORDINATOR_PERCENT),
                    invest_itr->amount.symbol
                );
                
                // Накапливаем сумму по инвестору
                if (investor_accumulations.find(investor) == investor_accumulations.end()) {
                    investor_accumulations[investor] = asset(0, coordinator_earning.symbol);
                }
                
                eosio::asset new_total = investor_accumulations[investor] + coordinator_earning;
                
                // Ограничиваем накопление лимитом 100,000 RUB
                if (new_total.amount > MAX_COORDINATOR_ACCUMULATION) {
                    coordinator_earning = eosio::asset(
                        MAX_COORDINATOR_ACCUMULATION - investor_accumulations[investor].amount, 
                        coordinator_earning.symbol
                    );
                }
                
                if (coordinator_earning.amount > 0) {
                    investor_accumulations[investor] += coordinator_earning;
                }
            }
        }
    }
    
    // Записываем выплаты за каждого инвестора
    for (const auto& pair : investor_accumulations) {
        if (pair.second.amount > 0) {
            record_coordinator_payout(coopname, coordinator, pair.first, result_hash, pair.second, pair.second);
        }
    }
    
    // Обновляем данные координатора - переносим из pending в earned
    coordinator_index coordinators(_capital, coopname.value);
    auto coordinator_itr = coordinators.find(coord.id);
    
    coordinators.modify(coordinator_itr, coordinator, [&](auto &c) {
        c.coordinator_base += c.pending_coordinator_base;
        c.earned += c.pending_coordinator_base;
        c.pending_coordinator_base = asset(0, c.pending_coordinator_base.symbol);
    });
} 