void meet::restartmeet(name coopname, checksum256 hash, document newproposal, time_point_sec new_open_at, time_point_sec new_close_at) {
    require_auth(coopname);

    // Получаем объект собрания
    auto meet_opt = get_meet(coopname, hash);
    eosio::check(meet_opt.has_value(), "Собрание не найдено");
    auto meet_record = meet_opt.value();

    // Проверяем, что собрание закрыто и кворум не пройден
    auto now = current_time_point();
    eosio::check(now.sec_since_epoch() > meet_record.close_at.sec_since_epoch(), "Собрание ещё не закрыто");
    eosio::check(meet_record.quorum_passed == false, "Собрание прошло кворум, перезапуск невозможен");

    // Валидируем новые даты
    if (!TEST_MODE) {
        eosio::check(new_open_at.sec_since_epoch() >= now.sec_since_epoch() + MIN_OPEN_AGM_DELAY_SEC, "Дата открытия должна быть не менее чем через 15 дней от текущего момента");
    }
    eosio::check(new_close_at.sec_since_epoch() > new_open_at.sec_since_epoch(), "Дата закрытия должна быть после даты открытия");

    // Проверяем документ нового предложения
    verify_document_or_fail(newproposal);

    // Обновляем запись собрания
    Meet::meets_index genmeets(_meet, coopname.value);
    auto meet_itr = genmeets.find(meet_record.id);
    eosio::check(meet_itr != genmeets.end(), "Собрание не найдено при обновлении");

    uint64_t old_cycle = meet_itr->cycle;
    uint64_t old_quorum = meet_itr->quorum_percent;
    
    document empty_document;
    
    genmeets.modify(meet_itr, coopname, [&](auto &m) {
        m.proposal           = newproposal;
        m.authorization    = empty_document;
        m.open_at            = new_open_at;
        m.close_at           = new_close_at;
        m.signed_ballots     = 0;
        m.current_quorum_percent = 0;
        m.quorum_passed      = false;
      
        m.cycle++; // переходим к следующему циклу
        
        // Уменьшаем требуемый процент кворума по заданной логике:
        //  1) при cycle=2 -> 50%
        //  2) при cycle=3 -> 25%
        //  3) при cycle >=4 -> делим текущее вдвое
        if (old_cycle == 1) {
            m.quorum_percent = 50;
        } else if (old_cycle == 2) {
            m.quorum_percent = 25;
        } else {
            // при cycle>=3 (т.е. после третьего запуска)
            // каждый раз делим предыдущее значение на 2
            m.quorum_percent = old_quorum / 2;
        }
    });

    // Обнуляем состояние голосования по всем вопросам данного собрания
    Meet::questions_index questions(_meet, coopname.value);
    auto questions_by_meet = questions.get_index<"bymeet"_n>();

    for (auto idx_itr = questions_by_meet.lower_bound(meet_record.id);
        idx_itr != questions_by_meet.end() && idx_itr->meet_id == meet_record.id;
        ++idx_itr)
    {
        auto main_itr = questions.find(idx_itr->primary_key());
        eosio::check(main_itr != questions.end(), "Не найден вопрос в основном индексе");

        questions.modify(main_itr, coopname, [&](auto &q) {
            q.counter_votes_for = 0;
            q.counter_votes_against = 0;
            q.counter_votes_abstained = 0;
            q.voters_for.clear();
            q.voters_against.clear();
            q.voters_abstained.clear();
        });
    }

    // Отправляем документ решения в совет
    Action::send<createagenda_interface>(
        _soviet,
        "createagenda"_n,
        _meet,
        coopname,
        meet_record.initiator,
        get_valid_soviet_action("createagm"_n),
        hash,
        _meet,
        "authagm"_n,
        "declagm"_n,
        newproposal,
        std::string("")
    );
}
