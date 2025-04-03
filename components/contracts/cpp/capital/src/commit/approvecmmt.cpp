void capital::approvecmmt(eosio::name coopname, checksum256 commit_hash, document empty_document) {
  require_auth(_soviet);
  
  auto exist_commit = get_commit(coopname, commit_hash);
  eosio::check(exist_commit.has_value(), "Коммит не найден");
  
  commit_index commits(_capital, coopname.value);
  auto commit = commits.find(exist_commit -> id);
  
  auto exist_result = get_result(coopname, commit -> result_hash);
  eosio::check(exist_result.has_value(), "Результат не найден");
  
  eosio::check(exist_result -> status == "created"_n, "Нельзя добавить коммит в уже закрытый результат");
  
  // Обновляем result
  result_index results(_capital, coopname.value);
  auto result = results.find(exist_result -> id);
  
  results.modify(result, _capital, [&](auto &row) {
      row.spended            += commit -> spended;
      row.creators_base    += commit -> spended;
      row.generated          += commit -> generated;
      row.creators_bonus     += commit -> creators_bonus;
      row.authors_bonus      += commit -> authors_bonus;
      row.capitalists_bonus  += commit -> capitalists_bonus;
      row.total              += commit -> total;
      row.total_creators_bonus_shares += commit-> spended.amount;
      row.commits_count++;
  });

  // Обновляем проект
  auto exist_project = get_project(coopname, commit -> project_hash);
  eosio::check(exist_project.has_value(),"Проект не найден");
  project_index projects(_capital, coopname.value);
  auto project = projects.find(exist_project -> id);
  
  projects.modify(project, _capital, [&](auto &p) {
      p.spended            += commit -> spended;
      p.generated          += commit -> generated;
      p.creators_base    += commit -> spended;
      p.creators_bonus     += commit -> creators_bonus;
      p.authors_bonus      += commit -> authors_bonus;
      p.capitalists_bonus  += commit -> capitalists_bonus;
      p.total              += commit -> total;
      
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
    ractors.emplace(_capital, [&](auto &ra){
        ra.id            = ractors.available_primary_key();
        ra.project_hash  = commit->project_hash;
        ra.result_hash   = commit->result_hash;
        ra.username      = commit->username;
        ra.spended = commit->spended;
        ra.contributed_hours  = commit->contributed_hours;
        // сумма, которая доступна для получения ссуды и используется в качества залога
        ra.provisional_amount = commit->spended;
        ra.creators_bonus_shares = commit->spended.amount;
    });
  } else {
    auto resactor = ractors.find(exist_resactor->id);
    ractors.modify(resactor, _capital, [&](auto &ra) {
        ra.spended += commit->spended;
        ra.contributed_hours  += commit->contributed_hours;
        ra.provisional_amount += commit->spended;
        ra.creators_bonus_shares += commit->spended.amount;
    });
  }

  commits.erase(commit);  
};