void capital::declinecmmt(eosio::name coopname, checksum256 commit_hash, std::string reason) {
  require_auth(_soviet);
  
  auto exist_commit = get_commit(coopname, commit_hash);
  eosio::check(exist_commit.has_value(), "Коммит не найден");
  
  commit_index commits(_capital, coopname.value);
  auto commit = commits.find(exist_commit -> id);
  
  commits.modify(commit, coopname, [&](auto &c) {
      c.status = "declined"_n;
      c.decline_comment = reason;
  });
}
