/**
 * @brief Завершение голосования по методу Водянова и расчет результатов
 * Вычисляет итоговые суммы для каждого участника и обновляет их балансы
 */
void capital::finalvodyanov(name coopname, name application, checksum256 result_hash) {
    require_auth(application);
    
    // Получаем информацию о распределении
    auto distribution = get_vodyanov_distribution_or_fail(coopname, result_hash, "Голосование не найдено");
    eosio::check(distribution.status == "voting"_n, "Голосование не активно");
    
    // Проверяем, что все участники проголосовали ИЛИ истек срок голосования
    bool deadline_passed = current_time_point() > distribution.voting_deadline;
    bool all_voted = distribution.votes_received >= distribution.total_participants;
    
    eosio::check(all_voted || deadline_passed, "Голосование еще не завершено");
    
    // Рассчитываем результаты для каждого участника
    calculate_vodyanov_results(coopname, distribution.id);
    
    // Обновляем статус распределения
    vodyanov_distribution_index distributions(_capital, coopname.value);
    auto dist_itr = distributions.find(distribution.id);
    distributions.modify(dist_itr, application, [&](auto &d) {
        d.status = "completed"_n;
    });
    
    // Обновляем балансы участников в соответствии с результатами голосования
    vodyanov_result_index results(_capital, coopname.value);
    auto by_distribution = results.get_index<"bydistrib"_n>();
    
    for (auto itr = by_distribution.lower_bound(distribution.id); 
         itr != by_distribution.end() && itr->distribution_id == distribution.id; 
         ++itr) {
        
        // Получаем результат для данного участника
        auto result_entry = Capital::get_result_by_assignment_and_username(coopname, distribution.assignment_hash, itr->participant);
        if (!result_entry.has_value()) continue;
        
        // Обновляем баланс участника (добавляем сумму от голосования Водянова)
        Capital::result_index results_table(_capital, coopname.value);
        auto result_itr = results_table.find(result_entry->id);
        if (result_itr != results_table.end()) {
            results_table.modify(result_itr, application, [&](auto &r) {
                r.available_for_convert += itr->final_amount;
                r.total_amount += itr->final_amount;
            });
        }
    }
} 