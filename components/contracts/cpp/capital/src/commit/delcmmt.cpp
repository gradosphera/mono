void capital::delcmmt(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 commit_hash) {
  require_auth(coopname);

  auto exist_commit = get_commit(coopname, commit_hash);
  eosio::check(exist_commit.has_value(), "Коммит с указанным хэшем не существует");

  commit_index commits(_capital, coopname.value);
  auto commit = commits.find(exist_commit->id);
  eosio::check(commit != commits.end(), "Коммит не найден");

  eosio::check(commit->status == "declined"_n, "Удалять можно только отклонённые коммиты");

  commits.erase(commit);
}
