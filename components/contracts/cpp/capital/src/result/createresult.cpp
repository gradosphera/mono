void capital::createresult(name coopname, name application, checksum256 project_hash, checksum256 result_hash, eosio::name assignee, std::string assignment) {
    check_auth_or_fail(_capital, coopname, application, "createresult"_n);

    auto project = get_project(coopname, project_hash);
    eosio::check(project.has_value(), "проект не найден");
    
    // Проверяем, существует ли уже RESULT
    result_index results(_capital, coopname.value);
    auto result = get_result(coopname, result_hash);
    eosio::check(!result.has_value(), "Объект результата уже существует");

    // Создаём RESULT
    results.emplace(coopname, [&](auto &n){
      n.id = get_global_id_in_scope(_capital, coopname, "results"_n);
      n.coopname = coopname;
      n.assignee = assignee;
      n.assignment = assignment;
      n.project_hash = project_hash;
      n.result_hash = result_hash;
      n.authors_shares = project -> authors_shares;
      n.authors_count = project -> authors_count;
    });
    
    authors_index authors(_capital, coopname.value);
    auto authors_hash_index = authors.get_index<"byprojecthash"_n>();
    
    // Перебираем всех авторов с данным project_hash
    auto author_itr = authors_hash_index.lower_bound(project_hash);
        
    uint64_t authors_count = 0;
    
    resactor_index ractors(_capital, coopname.value);
    
    // Копируем запись автора идеи в result_authors
    while(author_itr != authors_hash_index.end() && author_itr->project_hash == project_hash) {
        ractors.emplace(coopname, [&](auto &ra){
          ra.id          = ractors.available_primary_key();
          ra.result_hash = result_hash;
          ra.project_hash = project_hash;
          ra.username    = author_itr->username;
          ra.authors_shares = author_itr -> shares;
        });
        authors_count++;
        author_itr++;
    }
    
    eosio::check(authors_count > 0, "Нельзя создать результат без установленных авторов в проекте");
}