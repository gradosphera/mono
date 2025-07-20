void capital::createcmmt(eosio::name coopname, eosio::name application, eosio::name username, checksum256 assignment_hash, checksum256 commit_hash, uint64_t contributed_hours){
  require_auth(coopname);
  
  auto assignment = get_assignment(coopname, assignment_hash);
  eosio::check(assignment.has_value(), "Задание не найдено");
  
  auto contributor = get_active_contributor_or_fail(coopname, assignment -> project_hash, username);
  
  auto exist_commit = get_commit(coopname, commit_hash);
  
  eosio::check(!exist_commit.has_value(), "Действие с указанным хэшем уже существует");
  
  eosio::check(contributed_hours > 0, "Только положительная сумма часов");
  
  // считаем сумму фактических затрат создателя на основе ставки в час и потраченного времени
  // Используем персональную ставку пайщика
  eosio::asset spended = contributor -> rate_per_hour * contributed_hours;
  
  // Вычисляем премии на основе суммы фактических затрат
  auto amounts = capital::calculcate_capital_amounts(spended);
  
  commit_index commits(_capital, coopname.value);
  auto commit_id = get_global_id_in_scope(_capital, coopname, "commits"_n);
  
  commits.emplace(coopname, [&](auto &a) {
    a.id = commit_id;
    a.coopname = coopname;
    a.application = application;
    a.username = username;
    a.project_hash = assignment -> project_hash;
    a.assignment_hash = assignment_hash;
    a.commit_hash = commit_hash;
    a.contributed_hours = contributed_hours;
    a.rate_per_hour = contributor -> rate_per_hour;
    a.spended = spended;
    a.status = "created"_n;
    a.created_at = current_time_point();
    a.generated = amounts.generated;
    a.creators_bonus = amounts.creators_bonus;
    a.authors_bonus = amounts.authors_bonus;
    a.capitalists_bonus = amounts.capitalists_bonus;
    a.total = amounts.total;
  });
  
  auto empty_doc = document2{};
  
  //отправить на approve председателю
  Action::send<createapprv_interface>(
    _soviet,
    "createapprv"_n,
    _capital,
    coopname,
    username,
    empty_doc,
    commit_hash,
    _capital,
    "approvecmmt"_n,
    "declinecmmt"_n,
    std::string("")
  );

  
}