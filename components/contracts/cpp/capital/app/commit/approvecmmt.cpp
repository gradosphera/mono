void capital::approvecmmt(eosio::name coopname, checksum256 commit_hash, document2 empty_document) {
  require_auth(_soviet);
  
  auto exist_commit = Capital::get_commit(coopname, commit_hash);
  eosio::check(exist_commit.has_value(), "Коммит не найден");
  
  Capital::commit_index commits(_capital, coopname.value);
  auto commit = commits.find(exist_commit -> id);
  
  auto exist_assignment = Capital::get_assignment(coopname, commit -> assignment_hash);
  eosio::check(exist_assignment.has_value(), "Задание не найдено");
  
  eosio::check(exist_assignment -> status == "opened"_n, "Нельзя добавить коммит в уже закрытое задание");
  
  // Обновляем assignment
  Capital::assignment_index assignments(_capital, coopname.value);
  auto assignment = assignments.find(exist_assignment -> id);
  
  assignments.modify(assignment, _capital, [&](auto &row) {
      row.spended            += commit -> spended;
      row.creators_base      += commit -> spended;
      row.generated          += commit -> generated;
      row.creators_bonus     += commit -> creators_bonus;
      row.authors_bonus      += commit -> authors_bonus;
      row.capitalists_bonus  += commit -> capitalists_bonus;
      row.total              += commit -> total;
      row.total_creators_bonus_shares += commit-> spended.amount;
      row.commits_count++;
  });

  // Обновляем проект
  auto exist_project = Capital::get_project(coopname, commit -> project_hash);
  eosio::check(exist_project.has_value(),"Проект не найден");
  Capital::project_index projects(_capital, coopname.value);
  auto project = projects.find(exist_project -> id);
  
  projects.modify(project, _capital, [&](auto &p) {
      p.spended            += commit -> spended;
      p.generated          += commit -> generated;
      p.creators_base      += commit -> spended;
      p.creators_bonus     += commit -> creators_bonus;
      p.authors_bonus      += commit -> authors_bonus;
      p.capitalists_bonus  += commit -> capitalists_bonus;
      p.total              += commit -> total;
      
      p.commits_count++;
  });
    
  // Обновляем актора и проект
  auto exist_contributor = Capital::get_active_contributor_or_fail(coopname, commit -> project_hash, commit -> username);
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  contributors.modify(contributor, coopname, [&](auto &c){
      c.spended         += commit->spended;
      c.contributed_hours  += commit->contributed_hours;
  });

  // Обновляем запись в creauthors (создательские доли)
  auto exist_creauthor = Capital::get_creauthor(coopname, commit->assignment_hash, commit->username);
  Capital::creauthor_index creathors(_capital, coopname.value);
      
  if (!exist_creauthor.has_value()) {
    creathors.emplace(_capital, [&](auto &ra){
        ra.id            = creathors.available_primary_key();
        ra.project_hash  = commit->project_hash;
        ra.assignment_hash   = commit->assignment_hash;
        ra.username      = commit->username;
        ra.spended = commit->spended;
        ra.contributed_hours  = commit->contributed_hours;
        // сумма, которая доступна для получения ссуды и используется в качества залога
        ra.provisional_amount = commit->spended;
        ra.creator_bonus_shares = commit->spended.amount;
    });
  } else {
    auto creauthor = creathors.find(exist_creauthor->id);
    creathors.modify(creauthor, _capital, [&](auto &ra) {
        ra.spended += commit->spended;
        ra.contributed_hours  += commit->contributed_hours;
        ra.provisional_amount += commit->spended;
        ra.creator_bonus_shares += commit->spended.amount;
    });
  }

  commits.erase(commit);  
};