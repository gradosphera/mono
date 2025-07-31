/**
 * @brief Начинает голосование по методу Водянова для конкретного результата
 * Создает запись о распределении и инициализирует голосование
 */
void capital::startvodyanov(name coopname, name application, checksum256 result_hash) {
    require_auth(application);
    
    // Проверяем, что результат существует
    auto result = Capital::get_result(coopname, result_hash);
    eosio::check(result.has_value(), "Результат не найден");
    eosio::check(result->status == "approved"_n, "Результат должен быть одобрен для начала голосования");
    
    // Проверяем, что голосование для данного результата еще не создано
    auto existing_distribution = get_vodyanov_distribution(coopname, result_hash);
    eosio::check(!existing_distribution.has_value(), "Голосование для данного результата уже создано");
    
    // Получаем участников (авторы + создатели) для данного проекта
    auto participants = Capital::Projects::get_project_participants(coopname, result->project_hash);
    eosio::check(participants.size() >= 2, "Для голосования по методу Водянова необходимо минимум 2 участника");
    
    // Рассчитываем суммы для голосования (31.8% от всех премий авторов и создателей)
    eosio::asset total_vodyanov_amount = calculate_vodyanov_amounts(result->author_bonus_amount, result->creator_bonus_amount);
    
    // Рассчитываем голосующую сумму и равную долю
    uint32_t total_participants = participants.size();
    eosio::asset voting_amount = eosio::asset(
        int64_t(static_cast<double>(total_vodyanov_amount.amount) * (total_participants - 1) / total_participants), 
        total_vodyanov_amount.symbol
    );
    eosio::asset equal_share = eosio::asset(
        total_vodyanov_amount.amount / total_participants, 
        total_vodyanov_amount.symbol
    );
    
    // Создаем запись о распределении
    vodyanov_distribution_index distributions(_capital, coopname.value);
    auto distribution_id = get_global_id_in_scope(_capital, coopname, "vodyanovdist"_n);
    
    distributions.emplace(application, [&](auto &d) {
        d.id = distribution_id;
        d.result_hash = result_hash;
        d.project_hash = result->project_hash;
        d.coopname = coopname;
        d.status = "voting"_n;
        d.participants = participants;
        d.total_participants = total_participants;
        d.votes_received = 0;
        d.total_amount = total_vodyanov_amount;
        d.voting_amount = voting_amount;
        d.equal_share = equal_share;
        d.created_at = current_time_point();
        d.voting_deadline = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + 7 * 86400); // 7 дней
    });
} 