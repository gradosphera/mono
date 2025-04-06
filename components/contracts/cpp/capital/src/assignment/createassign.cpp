void capital::createassign(name coopname, name application, checksum256 project_hash, checksum256 assignment_hash, eosio::name assignee, std::string description) {
    require_auth(coopname);

    auto project = get_project(coopname, project_hash);
    eosio::check(project.has_value(), "проект не найден");
    
    // Проверяем, существует ли уже assignment
    assignment_index assignments(_capital, coopname.value);
    auto assignment = get_assignment(coopname, assignment_hash);
    eosio::check(!assignment.has_value(), "Объект задания уже существует");
    
    get_participant_or_fail(coopname, assignee);
    
    // Создаём assignment
    assignments.emplace(coopname, [&](auto &n) {
      n.id = get_global_id_in_scope(_capital, coopname, "assignments"_n);
      n.coopname = coopname;
      n.assignee = assignee;
      n.description = description;
      n.project_hash = project_hash;
      n.assignment_hash = assignment_hash;
      n.authors_shares = project -> authors_shares;
      n.authors_count = project -> authors_count;
    });
    
    authors_index authors(_capital, coopname.value);
    auto authors_hash_index = authors.get_index<"byprojecthash"_n>();
    
    // Перебираем всех авторов с данным project_hash
    auto author_itr = authors_hash_index.lower_bound(project_hash);
        
    uint64_t authors_count = 0;
    
    creauthor_index ractors(_capital, coopname.value);
    
    // Копируем запись автора идеи в assignment_authors
    while(author_itr != authors_hash_index.end() && author_itr->project_hash == project_hash) {
        ractors.emplace(coopname, [&](auto &ra){
          ra.id          = ractors.available_primary_key();
          ra.assignment_hash = assignment_hash;
          ra.project_hash = project_hash;
          ra.username    = author_itr->username;
          ra.author_shares = author_itr -> shares;
        });
        authors_count++;
        author_itr++;
    }
    
    eosio::check(authors_count > 0, "Нельзя создать задание без установленных авторов в проекте");
}