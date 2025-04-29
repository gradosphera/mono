void capital::setact1(eosio::name coopname, eosio::name application, eosio::name username, checksum256 commit_hash, document act) {
  check_auth_or_fail(_capital, coopname, application, "setact1"_n);
  
  verify_document_or_fail(act);

  // commits
  auto commit = get_commit(coopname, commit_hash);
  eosio::check(commit.has_value(), "Объект коммита не найден");
  eosio::check(commit -> username == username, "Неверно указано имя пользователя владельца задананиеа");
  
  auto assignment = get_assignment(coopname, commit -> assignment_hash);
  eosio::check(assignment.has_value(), "Задание не найдено");

  commit_index commits(_capital, coopname.value);
  auto commit_for_modify = commits.find(commit -> id);
  
  // Проверяем статус. 
  eosio::check(commit_for_modify -> status == "authorized"_n, "Неверный статус для поставки акта приёма-передачи");
  
  // commits.modify(commit_for_modify, coopname, [&](auto &n){
    // n.status = "act1"_n;
    // n.act1 = act;
  // });
};
