/**
 * @brief Подача голоса по методу Водянова
 * Участник распределяет voting_amount между остальными участниками
 */
void capital::submitvote(name coopname, name application, name voter, checksum256 result_hash, std::vector<std::pair<name, asset>> votes) {
    require_auth(application);
    
    // Получаем информацию о распределении
    auto distribution = get_vodyanov_distribution_or_fail(coopname, result_hash, "Голосование не найдено");
    eosio::check(distribution.status == "voting"_n, "Голосование не активно");
    eosio::check(current_time_point() <= distribution.voting_deadline, "Срок голосования истек");
    
    // Проверяем, что voter является участником голосования
    auto voter_it = std::find(distribution.participants.begin(), distribution.participants.end(), voter);
    eosio::check(voter_it != distribution.participants.end(), "Пользователь не является участником голосования");
    
    // Проверяем, что пользователь еще не голосовал
    eosio::check(!has_user_voted(coopname, distribution.id, voter), "Пользователь уже проголосовал");
    
    // Проверяем корректность голосов
    eosio::asset total_vote_amount = asset(0, distribution.voting_amount.symbol);
    std::set<name> voted_for;
    
    for (const auto& vote : votes) {
        // Нельзя голосовать за себя
        eosio::check(vote.first != voter, "Нельзя голосовать за себя");
        
        // Проверяем, что получатель голоса является участником
        auto recipient_it = std::find(distribution.participants.begin(), distribution.participants.end(), vote.first);
        eosio::check(recipient_it != distribution.participants.end(), "Получатель голоса не является участником");
        
        // Проверяем, что не голосуем за одного и того же участника дважды
        eosio::check(voted_for.insert(vote.first).second, "Нельзя голосовать за одного участника дважды");
        
        // Проверяем, что сумма голоса положительная
        eosio::check(vote.second.amount > 0, "Сумма голоса должна быть положительной");
        
        total_vote_amount += vote.second;
    }
    
    // Проверяем, что общая сумма голосов равна voting_amount
    eosio::check(total_vote_amount == distribution.voting_amount, "Общая сумма голосов должна равняться голосующей сумме");
    
    // Сохраняем голоса
    capital_tables::vodyanov_vote_index vote_table(_capital, coopname.value);
    for (const auto& vote : votes) {
        auto vote_id = get_global_id_in_scope(_capital, coopname, "vodyanovvote"_n);
        
        vote_table.emplace(application, [&](auto &v) {
            v.id = vote_id;
            v.distribution_id = distribution.id;
            v.result_hash = result_hash;
            v.voter = voter;
            v.recipient = vote.first;
            v.amount = vote.second;
            v.voted_at = current_time_point();
        });
    }
    
    // Обновляем счетчик голосов в распределении
    capital_tables::vodyanov_distribution_index distributions(_capital, coopname.value);
    auto dist_itr = distributions.find(distribution.id);
    distributions.modify(dist_itr, application, [&](auto &d) {
        d.votes_received++;
    });
} 