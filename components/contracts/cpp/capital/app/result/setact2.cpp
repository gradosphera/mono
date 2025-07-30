/**
 * @brief Принятие второго акта (act2). Убираем любой CRPS, просто плюсуем бонусы.
 */
void capital::setact2(
    eosio::name coopname,
    eosio::name application,
    eosio::name username,
    checksum256 result_hash,
    document2 act
) {
    check_auth_or_fail(_capital, coopname, application, "setact2"_n);
    verify_document_or_fail(act);
      
    auto exist_result = Capital::get_result(coopname, result_hash);
    eosio::check(exist_result.has_value(), "Объект результата не найден");

    Capital::result_index results(_capital, coopname.value);
    auto result = results.find(exist_result -> id);

    // Проверяем статус
    eosio::check(result -> status == "act1"_n, "Неверный статус результата.");

    results.modify(result, _capital, [&](auto &r){
      r.status = "act2"_n;
      r.act1 = act;
    });

    auto exist = Capital::get_project(coopname, result -> project_hash);
    eosio::check(exist.has_value(),"Проект не найден");
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(exist -> id);
    
    auto contributor = Capital::get_active_contributor_with_appendix_or_fail(coopname, result -> project_hash, result -> username);
    
    Capital::contributor_index contributors(_capital, coopname.value);
    auto contributor_for_modify = contributors.find(contributor -> id);
    
    contributors.modify(contributor_for_modify, coopname, [&](auto &c){
      c.share_balance += result -> creator_base_amount;
    });
    
    projects.modify(project, coopname, [&](auto &p) {
      p.total_share_balance += result -> creator_base_amount;
    });
    
    std::string memo = "Зачёт части целевого паевого взноса по договору УХД с ID: " + std::to_string(contributor -> id) + " в качестве паевого взноса по программе 'Цифровой Кошелёк' с ID: " + std::to_string(result -> id);
    
    //Увеличиваем баланс средств в капитализации
    //TODO: 
    Wallet::add_blocked_funds(_capital, coopname, result -> username, result -> creator_base_amount, _source_program, memo);
    
    //Удаляем объект result за ненадобностью
    //??? 
    
}
