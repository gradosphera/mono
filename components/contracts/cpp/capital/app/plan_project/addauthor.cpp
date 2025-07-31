void capital::addauthor(name coopname, name application, checksum256 project_hash, name author, uint64_t shares) {
    check_auth_or_fail(_capital, coopname, application, "addauthor"_n);
    eosio::check(shares == 1, "Количество shares должно быть равно 1");
    
    // Проверяем существование проекта
    Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Проверяем, что пользователь является участником проекта
    auto contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, project_hash, author);
    
    // Добавляем автора как генератора с авторскими долями
    Capital::Circle::upsert_author_segment(coopname, project_hash, author, shares);

    // Обновляем проект
    Capital::Projects::add_author(coopname, project_hash, shares);
}
