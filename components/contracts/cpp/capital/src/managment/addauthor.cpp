void capital::addauthor(name coopname, name application, checksum256 project_hash, name author, uint64_t shares) {
    check_auth_or_fail(_capital, coopname, application, "addauthor"_n);
    
    // Согласно новому ТЗ по методу Водянова - авторы имеют равные доли
    // Параметр shares больше не используется для различения долей
    uint64_t equal_shares = 1; // Каждый автор получает равную долю
    
    auto project = get_project(coopname, project_hash);
    
    eosio::check(project.has_value(), "Проект с указанным хэшем не найден");
    
    auto contributor = get_active_contributor_or_fail(coopname, project_hash, author);
    
    authors_index authors(_capital, coopname.value);
    auto project_author_index = authors.get_index<"byprojauthor"_n>();

    uint128_t combined_id = combine_checksum_ids(project_hash, author);
    auto author_itr = project_author_index.find(combined_id);
    
    // Проверяем, что автор еще не добавлен к проекту
    eosio::check(author_itr == project_author_index.end(), "Автор уже добавлен к проекту");
    
    authors.emplace(coopname, [&](auto& row) {
      row.id = get_global_id_in_scope(_capital, coopname, "authors"_n); 
      row.project_hash = project_hash;
      row.username = author;
      row.shares = equal_shares; // Равные доли для всех авторов
    });

    project_index projects(_capital, coopname.value);
    auto project_for_modify = projects.find(project -> id);
    
    // Обновляем shares и authors_count в проекте
    projects.modify(project_for_modify, coopname, [&](auto& row) {
      row.authors_shares += equal_shares;
      row.authors_count++;
    });
}
