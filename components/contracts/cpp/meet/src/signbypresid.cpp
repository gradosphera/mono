void meet::signbypresid(name coopname, name username, checksum256 hash, document2 presider_decision) {
    require_auth(coopname);

    // 1. Находим собрание по хэшу
    auto meet_opt = get_meet(coopname, hash);
    eosio::check(meet_opt.has_value(), "Собрание не найдено");
    auto meet_record = meet_opt.value();

    eosio::check(username == meet_record.presider, "Вы не являетесь председателем собрания");
    
    // Проверяем, что текущее время > close_at
    auto now = current_time_point();
    if (!TEST_MODE) {
        eosio::check(now.sec_since_epoch() > meet_record.close_at.sec_since_epoch(), 
                     "Собрание ещё не завершено по времени (close_at).");
    }

    // Проверяем, что кворум достигнут
    eosio::check(meet_record.quorum_passed == true, 
                 "Собрание не достигло кворума, не может быть закрыто с успехом.");
    
    // Проверяем, что секретарь уже подписал протокол
    eosio::check(meet_record.status == "preclose"_n, "Протокол должен быть сначала подписан секретарем собрания");
    
    // Проверяем документ
    verify_document_or_fail(presider_decision);

    // Сформируем данные об итогах голосования по каждому вопросу
    Meet::questions_index questions(_meet, coopname.value);
    auto by_meet = questions.get_index<"bymeet"_n>();
    
    std::vector<question_result> results;
    for (auto qitr = by_meet.lower_bound(meet_record.id);
         qitr != by_meet.end() && qitr->meet_id == meet_record.id; ++qitr)
    {
        bool accepted = false;
        if (meet_record.signed_ballots > 0) {
            // Простая логика 50%:
            accepted = (qitr->counter_votes_for * 100) > (meet_record.signed_ballots * 50);
        }
        
        results.push_back(question_result{
            qitr->id,
            qitr->title,
            qitr->decision,
            qitr->context,
            qitr->counter_votes_for,
            qitr->counter_votes_against,
            qitr->counter_votes_abstained,
            accepted
        });
    }

    // Обновляем запись в таблице, сохраняя решение председателя
    Meet::meets_index genmeets(_meet, coopname.value);
    auto hash_index = genmeets.get_index<"byhash"_n>();
    auto meet_itr = hash_index.find(hash);
    
    eosio::check(meet_itr != hash_index.end(), "Собрание не найдено");
    
    hash_index.modify(meet_itr, same_payer, [&](auto& m) {
        m.decision2 = presider_decision;
        m.status = "closed"_n;
    });

    // *** Вызов сервисного действия newgdecision (inline action) ***
    Action::send<newgdecision_interface>(
        _meet,             // имя контракта, где объявлен action newgdecision
        "newgdecision"_n,  // имя экшена
        _meet,             // актор (permission_level{get_self(),"active"})
        coopname,
        hash,
        results,
        meet_record.signed_ballots,
        meet_record.quorum_percent,
        meet_record.quorum_passed
    );

    // После записи решения – удаляем все вопросы
    auto qitr = by_meet.lower_bound(meet_record.id);
    while (qitr != by_meet.end() && qitr->meet_id == meet_record.id) {
        qitr = by_meet.erase(qitr);
    }
      
  // отправляем документ в принятый реестр
  
  Action::send<newresolved_interface>(
    _soviet,
    "newresolved"_n,
    _meet,
    coopname,
    username,
    get_valid_soviet_action("completegm"_n),
    hash,
    presider_decision
  );
} 