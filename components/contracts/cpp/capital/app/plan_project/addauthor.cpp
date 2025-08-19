void capital::addauthor(name coopname, checksum256 project_hash, name author) {
    require_auth(coopname);
    
    // Проверяем существование проекта
    Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Проверяем, что пользователь является участником проекта
    Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, project_hash, author);
    
    // Проверяем, что пользователь еще не является автором
    auto existing_segment = Capital::Segments::get_segment(coopname, project_hash, author);
    if (existing_segment.has_value() && existing_segment->is_author) {
        eosio::check(false, "Пользователь уже является автором проекта");
    }
    
    // Проверяем лимит количества авторов
    uint64_t current_authors_count = Capital::Segments::count_project_authors(coopname, project_hash);
    eosio::check(current_authors_count < MAX_PROJECT_AUTHORS, "Превышено максимальное количество соавторов в проекте");
    
    // Добавляем автора как генератора с авторскими долями
    Capital::Core::upsert_author_segment(coopname, project_hash, author);

}
