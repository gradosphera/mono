void capital::addauthor(name coopname, name application, checksum256 project_hash, name author, uint64_t shares) {
    check_auth_or_fail(_capital, coopname, application, "addauthor"_n);
    eosio::check(shares <= HUNDR_PERCENTS, "Количество shares должно быть меньше или равно 1000000");
    
    auto project = Capital::get_project(coopname, project_hash);
    
    eosio::check(project.has_value(), "Проект с указанным хэшем не найден");
    
    auto contributor = Capital::get_active_contributor_with_appendix_or_fail(coopname, project_hash, author);
    
    Capital::authors_index authors(_capital, coopname.value);
    auto project_author_index = authors.get_index<"byprojauthor"_n>();

    uint128_t combined_id = combine_checksum_ids(project_hash, author);
    auto author_itr = project_author_index.find(combined_id);
    
    authors.emplace(coopname, [&](auto& row) {
      row.id = get_global_id_in_scope(_capital, coopname, "authors"_n); 
      row.project_hash = project_hash;
      row.username = author;
      row.shares = shares;
    });

    Capital::project_index projects(_capital, coopname.value);
    auto project_for_modify = projects.find(project -> id);
    
    // Обновляем shares и authors_count в проекте
    projects.modify(project_for_modify, coopname, [&](auto& row) {
      row.authors_shares += shares;
      row.authors_count++;
    });
}
