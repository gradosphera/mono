void capital::addauthor(name coopname, name application, checksum256 project_hash, name author, uint64_t shares) {
    check_auth_or_fail(_capital, coopname, application, "addauthor"_n);
    eosio::check(shares == 1, "Количество shares должно быть равно 1");
    
    // Проверяем существование проекта
    Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Проверяем, что пользователь является участником проекта
    Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, project_hash, author);
    
    // Проверяем, что пользователь еще не является автором
    auto existing_segment = Capital::Circle::get_segment(coopname, project_hash, author);
    if (existing_segment.has_value() && existing_segment->author_shares > 0) {
        eosio::check(false, "Пользователь уже является автором проекта");
    }
    
    // Проверяем лимит количества авторов
    uint64_t current_authors_count = Capital::Circle::count_project_authors(coopname, project_hash);
    eosio::check(current_authors_count < MAX_PROJECT_AUTHORS, "Превышено максимальное количество авторов в проекте");
    
    // Добавляем автора как генератора с авторскими долями
    Capital::Core::upsert_author_segment(coopname, project_hash, author, shares);

    // Обновляем проект
    Capital::Projects::add_author(coopname, project_hash, shares);
}
