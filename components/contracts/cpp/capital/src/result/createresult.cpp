void capital::createresult(name coopname, name application, checksum256 project_hash, checksum256 result_hash) {
    check_auth_or_fail(_capital, coopname, application, "generate"_n);

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
      n.project_hash = project_hash;
      n.result_hash = result_hash;
      n.authors_shares = project -> authors_shares;
      n.authors_count = project -> authors_count;
    });
    
    authors_index authors(_capital, coopname.value);
    auto authors_hash_index = authors.get_index<"byprojecthash"_n>();
    
    // Перебираем всех авторов с данным project_hash
    auto author_itr = authors_hash_index.lower_bound(project_hash);
    
    result_authors_index result_authors(_capital, coopname.value);
    
    uint64_t authors_count = 0;
    
    // Копируем запись автора идеи в result_authors
    while(author_itr != authors_hash_index.end() && author_itr->project_hash == project_hash) {
        result_authors.emplace(coopname, [&](auto &n){
            n.id = get_global_id_in_scope(_capital, coopname, "resauthors"_n);
            n.username = author_itr->username;
            n.result_hash = result_hash;
            n.project_hash = project_hash;
            n.shares = author_itr -> shares;
        });
        authors_count++;
        author_itr++;
    }
    eosio::check(authors_count > 0, "Нельзя создать результат без установленных авторов в проекте");
       
}