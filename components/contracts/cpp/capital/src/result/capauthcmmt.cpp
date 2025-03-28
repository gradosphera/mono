void capital::capauthcmmt(eosio::name coopname, uint64_t commit_id, document authorization) {
  require_auth(_soviet);

  commit_index commits(_capital, coopname.value);
  auto commit = commits.find(commit_id);
  eosio::check(commit != commits.end(), "Коммит не найден");
  
  auto contributor = get_active_contributor_or_fail(coopname, commit->project_hash, commit->username);
  
  //TODO: change to coopname
  commits.modify(commit, _soviet, [&](auto &n) {
    n.status = "authorized"_n;
    // n.authorization = authorization;
  });
  
};
