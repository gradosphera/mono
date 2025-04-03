void capital::capauthcmmt(eosio::name coopname, checksum256 commit_hash, document authorization) {
  require_auth(_soviet);

  auto exist_commit = get_commit(coopname, commit_hash);
  eosio::check(exist_commit.has_value(), "Коммит не найден");
  
  commit_index commits(_capital, coopname.value);
  auto commit = commits.find(exist_commit -> id);
  
  auto contributor = get_active_contributor_or_fail(coopname, commit->project_hash, commit->username);
  
  //TODO: change to coopname
  commits.modify(commit, _soviet, [&](auto &n) {
    n.status = "authorized"_n;
    // n.authorization = authorization;
  });
  
};
