void capital::createcmmt(eosio::name coopname, eosio::name application, eosio::name username, checksum256 result_hash, checksum256 commit_hash, uint64_t contributed_hours){
  check_auth_or_fail(_capital, coopname, application, "createcmmt"_n);
  
  auto result = get_result(coopname, result_hash);
  eosio::check(result.has_value(), "Результат не найден");
  
  auto contributor = get_active_contributor_or_fail(coopname, result -> project_hash, username);
  
  auto exist_commit = get_commit(coopname, commit_hash);
  
  eosio::check(!exist_commit.has_value(), "Действие с указанным хэшем уже существует");
  
  eosio::check(contributed_hours > 0, "Только положительная сумма часов");
  
  eosio::asset spended = contributor -> rate_per_hour * contributed_hours;
  
  // Вычисляем премии
  auto br = capital::calculcate_capital_amounts(spended.amount);

  eosio::asset creators_bonus     (br.creators_bonus,    spended.symbol);
  eosio::asset authors_bonus      (br.authors_bonus,     spended.symbol);
  eosio::asset capitalists_bonus  (br.capitalists_bonus, spended.symbol);
  
  commit_index commits(_capital, coopname.value);
  auto commit_id = get_global_id_in_scope(_capital, coopname, "commits"_n);
  commits.emplace(coopname, [&](auto &a) {
    a.id = commit_id;
    a.status = "created"_n;
    a.coopname = coopname;
    a.application = application;
    a.username = username;
    a.project_hash = result -> project_hash;
    a.result_hash = result_hash;
    a.commit_hash = commit_hash;
    a.contributed_hours = contributed_hours;
    a.rate_per_hour = contributor -> rate_per_hour;
    a.spended = spended;
    a.creators_bonus = creators_bonus;
    a.authors_bonus = authors_bonus;
    a.capitalists_bonus = capitalists_bonus;
    a.created_at = current_time_point();
  });
  
  auto empty_doc = document{};
  
  //отправить на approve председателю
  // Отправляем в совет approve-запрос
  action(
    permission_level{_capital, "active"_n}, // кто вызывает
    _soviet,
    "createapprv"_n,
    std::make_tuple(
      coopname,
      username,
      empty_doc,
      commit_hash, // внешний ID, например ID заявки
      _capital, // callback_contract (текущий контракт)
      "approvecmmt"_n, // callback_action_approve
      "declinecmmt"_n, // callback_action_decline
      std::string("") 
    )
  ).send();
  
  
}