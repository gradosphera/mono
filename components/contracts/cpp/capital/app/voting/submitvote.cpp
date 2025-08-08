/**
 * @brief Подача голоса по методу Водянова
 * Участник распределяет общую голосующую сумму между остальными участниками
 */
void capital::submitvote(name coopname, name application, name voter, checksum256 project_hash, std::vector<std::pair<name, asset>> votes) {
    require_auth(application);
    
    // Получаем проект и проверяем состояние голосования
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    eosio::check(project.status == Capital::Projects::Status::VOTING, "Проект не в статусе голосования");
    eosio::check(current_time_point().sec_since_epoch() <= project.voting.voting_deadline.sec_since_epoch(), "Срок голосования истек");
    
    // Проверяем участника голосования
    eosio::check(Capital::Segments::is_voting_participant(coopname, project_hash, voter), "Пользователь не является участником голосования");
    eosio::check(!Capital::Votes::has_user_voted(coopname, project_hash, voter), "Пользователь уже проголосовал");
    
    // Получаем общую сумму на распределение по Водянову
    eosio::asset total_voting_pool = project.voting.amounts.total_voting_pool;
    
    // Получаем голосующую сумму
    eosio::asset voting_amount = project.voting.amounts.voting_amount;
    
    // Проверяем корректность голосов
    eosio::asset total_vote_amount = asset(0, _root_govern_symbol);
    
    // Получаем общее количество участников голосования без одного (самого участника, который голосует)
    uint32_t total_voters_except_one = project.voting.total_voters - 1;
    
    std::set<name> voted_for;
    uint32_t total_voters = 0;
    
    for (const auto& vote : votes) {
        eosio::check(vote.first != voter, "Нельзя голосовать за себя");
        eosio::check(Capital::Segments::is_voting_participant(coopname, project_hash, vote.first), "Получатель голоса не является участником голосования");
        eosio::check(voted_for.insert(vote.first).second, "Нельзя голосовать за одного участника дважды");
        eosio::check(vote.second.amount > 0, "Сумма голоса должна быть положительной");
        
        total_vote_amount += vote.second;
        total_voters++;
    }
    
    eosio::check(total_voters == total_voters_except_one, "Количество участников за кого отдается голос должно равняться общему количеству участников без одного");
    eosio::check(total_vote_amount + voting_amount == total_voting_pool, "(Общая сумма голосов + Голосующая сумма) должны равняться сумме на распределении `total_voting_pool`");
    
    // Сохраняем голоса
    for (const auto& vote : votes) {
        Capital::Votes::add_vote(coopname, application, project_hash, voter, vote.first, vote.second);
    }
    
    // Обновляем счетчик полученных голосов
    Capital::Projects::increment_votes_received(coopname, project_hash);
} 