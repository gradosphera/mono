void capital::approvecmmt(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 commit_hash, document approved_specification){
  check_auth_or_fail(_capital, coopname, application, "approvecmmt"_n);
  
  verify_document_or_fail(approved_specification);
  
  auto exist_commit = get_commit(coopname, commit_hash);
  eosio::check(exist_commit.has_value(), "Действие с указанным хэшем не существует");
  
  auto result = get_result(coopname, exist_commit -> result_hash);
  eosio::check(result.has_value(), "Результат не найден");
  
  eosio::check(result -> status == "created"_n, "Нельзя добавить действие в уже закрытый результат");
  
  commit_index commits(_capital, coopname.value);
  auto commit = commits.find(exist_commit -> id);
  
  commits.modify(commit, coopname, [&](auto &a){
    a.status = "approved"_n;
    a.approved_specification = approved_specification;
  });
  
  auto exist_contributor = get_active_contributor_or_fail(coopname, result -> project_hash, commit -> username);
  
  contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  
  // Рассчитываем долю, которая идет в for_convert
  double convert_ratio = static_cast<double>(contributor->convert_percent) / HUNDR_PERCENTS;
  asset for_convert = asset(static_cast<int64_t>(commit->spend.amount * convert_ratio), commit->spend.symbol);

  // Остаток идет в available
  asset available = commit -> spend - for_convert;

  contributors.modify(contributor, coopname, [&](auto &c){
    c.available += available;
    c.for_convert += for_convert;
    c.contributed_hours = commit -> contributed_hours;
    c.spend += commit -> spend;
  });

  auto br = capital::calculcate_capital_amounts(commit -> spend.amount);

  // Формируем eosio::asset из результатов
  eosio::asset creators_bonus(br.creators_bonus, commit -> spend.symbol);
  eosio::asset authors_bonus(br.authors_bonus, commit -> spend.symbol);
  eosio::asset generated(br.generated, commit -> spend.symbol);
  eosio::asset participants_bonus(br.participants_bonus, commit -> spend.symbol);
  eosio::asset total(br.total, commit -> spend.symbol);

  // Обновляем запись в таблице results
  result_index results(_capital, coopname.value);
  auto result_for_modyfy = results.find(result -> id);

  eosio::check(result -> available >= commit -> spend, "Недостаточно средств в результате для приёма действия");
  
  results.modify(result_for_modyfy, coopname, [&](auto& row) {
      row.available -= commit -> spend;
      row.spend += commit -> spend;
    
      row.creators_amount     += commit -> spend;
      row.creators_bonus      += creators_bonus;
      row.authors_bonus       += authors_bonus;
      row.generated_amount    += generated;
      row.participants_bonus  += participants_bonus;
      row.participants_bonus_remain  += participants_bonus;
      row.total_amount        += total;
      row.commits_count++;
  });
  
  
  //обновить сгенерированную сумму по проекту
  auto exist_project = get_project(coopname, result -> project_hash);
  project_index projects(_capital, coopname.value);
  auto project = projects.find(exist_project->id);
  
  projects.modify(project, _capital, [&](auto &p) {
    p.generated += generated;    
  });
  
};