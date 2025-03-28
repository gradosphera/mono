void capital::approvecmmt(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 commit_hash) {
  check_auth_or_fail(_capital, coopname, application, "approvecmmt"_n);
  
  auto exist_commit = get_commit(coopname, commit_hash);
  eosio::check(exist_commit.has_value(), "Коммит с указанным хэшем не существует");
  
  auto exist_result = get_result(coopname, exist_commit -> result_hash);
  eosio::check(exist_result.has_value(), "Результат не найден");
  
  eosio::check(exist_result -> status == "created"_n, "Нельзя добавить коммит в уже закрытый результат");
  
  commit_index commits(_capital, coopname.value);
  auto commit = commits.find(exist_commit -> id);
  
  // Обновляем result
  result_index results(_capital, coopname.value);
  auto result = results.find(exist_result -> id);
  
  results.modify(result, coopname, [&](auto &row) {
      row.spended            += commit -> spended;
      row.creators_bonus     += commit -> creators_bonus;
      row.authors_bonus      += commit -> authors_bonus;
      row.capitalists_bonus  += commit -> capitalists_bonus;
      row.commits_count++;
  });

  // Обновляем проект
  auto exist_project = get_project(coopname, commit -> project_hash);
  eosio::check(exist_project.has_value(),"Проект не найден");
  project_index projects(_capital, coopname.value);
  auto project = projects.find(exist_project -> id);
  
  projects.modify(project, coopname, [&](auto &p) {
      p.spended            += commit->spended;
      p.creators_bonus     += commit -> creators_bonus;
      p.authors_bonus      += commit -> authors_bonus;
      p.capitalists_bonus  += commit -> capitalists_bonus;
      p.commits_count++;
  });
    
  // Обновляем актора и проект
  auto exist_contributor = get_active_contributor_or_fail(coopname, commit -> project_hash, commit -> username);
  contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  contributors.modify(contributor, coopname, [&](auto &c){
      c.spended         += commit->spended;
      c.contributed_hours  += commit->contributed_hours;
  });

  // Обновляем запись в resactors (создательские доли)
  auto exist_resactor = get_resactor(coopname, commit->result_hash, commit->username);
  resactor_index ractors(_capital, coopname.value);
      
  if (!exist_resactor.has_value()) {
    ractors.emplace(coopname, [&](auto &ra){
        ra.id            = ractors.available_primary_key();
        ra.project_hash  = commit->project_hash;
        ra.result_hash   = commit->result_hash;
        ra.username      = commit->username;
        ra.spended = commit->spended;
        ra.contributed_hours  = commit->contributed_hours;
        // сумма, которая доступна для получения ссуды и используется в качества залога
        ra.provisional_amount = commit->spended;
    });
  } else {
    auto resactor = ractors.find(exist_resactor->id);
    ractors.modify(resactor, coopname, [&](auto &ra) {
        ra.spended += commit->spended;
        ra.contributed_hours  += commit->contributed_hours;
        ra.provisional_amount += commit->spended;
    });    
  }

  commits.erase(commit);  
};