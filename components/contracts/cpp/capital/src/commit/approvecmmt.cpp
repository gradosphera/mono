void capital::approvecmmt(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 commit_hash, document approved_statement){
  check_auth_or_fail(_capital, coopname, application, "approvecmmt"_n);
  
  verify_document_or_fail(approved_statement);
  
  auto exist_commit = get_commit(coopname, commit_hash);
  eosio::check(exist_commit.has_value(), "Действие с указанным хэшем не существует");
  
  auto result = get_result(coopname, exist_commit -> result_hash);
  eosio::check(result.has_value(), "Результат не найден");
  
  eosio::check(result -> status == "created"_n, "Нельзя добавить действие в уже закрытый результат");
  
  commit_index commits(_capital, coopname.value);
  auto commit = commits.find(exist_commit -> id);
  
  commits.modify(commit, coopname, [&](auto &a) {
    a.status = "approved"_n;
    a.approved_statement = approved_statement;
  });
  
  //отправляем в совет
  action(permission_level{ _capital, "active"_n}, _soviet, "createagenda"_n,
    std::make_tuple(coopname, commit -> username, _capital, _capital_commit_authorize_action, commit -> id, commit -> contribution_statement, std::string("")))
  .send();  
  
};