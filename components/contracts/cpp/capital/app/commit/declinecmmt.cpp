void capital::declinecmmt(eosio::name coopname, checksum256 commit_hash, std::string reason) {
  require_auth(_soviet);
  
  auto commit = Capital::Commits::get_commit_or_fail(coopname, commit_hash);
  
  Capital::Commits::delete_commit(coopname, commit_hash);
}
