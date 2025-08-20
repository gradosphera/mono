/**
 * @brief Подает голос по методу Водянова
 * Участник распределяет общую голосующую сумму между остальными участниками:
 * - Проверяет статус проекта и срок голосования
 * - Валидирует участника голосования
 * - Проверяет корректность голосов (суммы, получатели, уникальность)
 * - Сохраняет голоса в системе
 * - Обновляет счетчик полученных голосов
 * @param coopname Наименование кооператива
 * @param voter Наименование пользователя-голосующего
 * @param project_hash Хеш проекта для голосования
 * @param votes Вектор голосов для распределения
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_submitvote
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::submitvote(name coopname, name voter, checksum256 project_hash, std::vector<Capital::vote_input> votes) {
    require_auth(coopname);
    
    // Получаем проект и проверяем состояние голосования
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    eosio::check(project.status == Capital::Projects::Status::VOTING, "Проект не в статусе голосования");
    eosio::check(current_time_point().sec_since_epoch() <= project.voting.voting_deadline.sec_since_epoch(), "Срок голосования истек");
    
    // Проверяем участника голосования
    eosio::check(Capital::Segments::is_voting_participant(coopname, project_hash, voter), "Пользователь не является участником голосования");
    eosio::check(!Capital::Votes::has_user_voted(coopname, project_hash, voter), "Пользователь уже проголосовал");
    
    // Получаем общую сумму на распределение по Водянову
    eosio::asset total_voting_pool = project.voting.amounts.total_voting_pool;
    
    // Получаем активную голосующую сумму
    eosio::asset active_voting_amount = project.voting.amounts.active_voting_amount;
    
    // Получаем среднюю не голосующую сумму для каждого участника
    eosio::asset equal_voting_amount = project.voting.amounts.equal_voting_amount;
    
    // Проверяем корректность голосов
    eosio::asset total_vote_amount = asset(0, _root_govern_symbol);
    
    // Получаем общее количество участников голосования без одного (самого участника, который голосует)
    uint32_t total_voters_except_one = project.voting.total_voters - 1;
    
    std::set<name> voted_for;
    uint32_t total_voters = 0;
    
    for (const auto& vote : votes) {
        eosio::check(vote.recipient != voter, "Нельзя голосовать за себя");
        eosio::check(Capital::Segments::is_voting_participant(coopname, project_hash, vote.recipient), "Получатель голоса не является участником голосования");
        eosio::check(voted_for.insert(vote.recipient).second, "Нельзя голосовать за одного участника дважды");
        eosio::check(vote.amount.amount > 0, "Сумма голоса должна быть положительной");
        
        total_vote_amount += vote.amount;
        total_voters++;
    }
    
    eosio::check(total_voters == total_voters_except_one, "Количество участников за кого отдается голос должно равняться общему количеству участников без одного");
    eosio::check(total_vote_amount == active_voting_amount, "Общая сумма голосов должна быть равна активной голосующей сумме");
    eosio::check(total_vote_amount + equal_voting_amount == total_voting_pool, "(Общая сумма голосов + Равная не голосующая сумма) должны равняться сумме на распределении `total_voting_pool`");
    
    // Сохраняем голоса
    for (const auto& vote : votes) {
        Capital::Votes::add_vote(coopname, project_hash, voter, vote.recipient, vote.amount);
    }
    
    // Обновляем счетчик полученных голосов
    Capital::Projects::increment_votes_received(coopname, project_hash);
} 