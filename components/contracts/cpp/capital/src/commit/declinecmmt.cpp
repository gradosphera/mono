void capital::declinecmmt(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 commit_hash, std::string comment) {
  check_auth_or_fail(_capital, coopname, application, "declinecmmt"_n);

  auto exist_commit = get_commit(coopname, commit_hash);
  eosio::check(exist_commit.has_value(), "Коммит с указанным хэшем не существует");

  commit_index commits(_capital, coopname.value);
  auto commit = commits.find(exist_commit->id);
  eosio::check(commit != commits.end(), "Коммит не найден");

  eosio::check(commit->status == "created"_n, "Коммит уже обработан");

  commits.modify(commit, coopname, [&](auto &c) {
      c.status = "declined"_n;
      c.decline_comment = comment;
  });
}
