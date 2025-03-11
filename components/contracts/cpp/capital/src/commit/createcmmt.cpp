void capital::createcmmt(eosio::name coopname, eosio::name application, eosio::name creator, checksum256 result_hash, checksum256 commit_hash, uint64_t contributed_hours, document specification){
  check_auth_or_fail(_capital, coopname, application, "createcmmt"_n);
  
  verify_document_or_fail(specification);
  
  auto result = get_result(coopname, result_hash);
  eosio::check(result.has_value(), "Результат не найден");
  
  auto contributor = get_active_contributor_or_fail(coopname, result -> project_hash, creator);
  
  auto exist_commit = get_commit(coopname, commit_hash);
  eosio::check(!exist_commit.has_value(), "Действие с указанным хэшем уже существует");
  
  eosio::check(contributed_hours > 0, "Только положительная сумма");
  
  eosio::asset spend = contributor -> rate_per_hour * contributed_hours;
  
  commit_index commits(_capital, coopname.value);
  
  commits.emplace(coopname, [&](auto &a) {
    a.id = get_global_id_in_scope(_capital, coopname, "commits"_n);
    a.coopname = coopname;
    a.application = application;
    a.username = creator;
    a.project_hash = result -> project_hash;
    a.result_hash = result_hash;
    a.commit_hash = commit_hash;
    a.contributed_hours = contributed_hours;
    a.spend = spend;
    a.created_at = current_time_point();
    a.specification = specification;
  });
}