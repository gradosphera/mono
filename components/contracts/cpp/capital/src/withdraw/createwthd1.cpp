void capital::createwthd1(eosio::name coopname, eosio::name application, eosio::name username, checksum256 result_hash, checksum256 withdraw_hash, std::vector<checksum256> commit_hashes, document contribution_statement, document return_statement) {
  check_auth_or_fail(_capital, coopname, application, "getaid"_n);
  
  verify_document_or_fail(contribution_statement);
  verify_document_or_fail(return_statement);
  
  auto exist_result = get_result(coopname, result_hash);
  eosio::check(exist_result.has_value(), "Результат с указанным хэшем не найден");
  
  auto exist_project = get_project(coopname, exist_result -> project_hash);
  eosio::check(exist_project.has_value(), "Проект с указанным хэшем не найден");
  
  auto exist_contributor = capital::get_active_contributor_or_fail(coopname, exist_result -> project_hash, username);
  
  
  eosio::asset amount = asset(0, _root_govern_symbol);
  uint64_t count = 0;
  
  for (const auto& commit_hash : commit_hashes) {
    amount += get_amount_for_withdraw_from_commit(coopname, username, commit_hash);
    count++;
    eosio::check(count <= 20, "Нельзя оформить более 20 коммитов на раз");
  }
  
  contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  
  eosio::check(contributor -> available >= amount, "Недостаточно средств для создания запроса на материальную помощь");
  
  contributors.modify(contributor, coopname, [&](auto &c) {
    c.available -= amount;
  });
  
  auto exist_withdraw = get_withdraw(coopname, withdraw_hash);
  
  eosio::check(!exist_withdraw.has_value(), "Заявка на взнос-возврат с таким хэшем уже существует");
  
  capital_tables::withdraws_index withdraws(_capital, coopname.value);
  
  withdraws.emplace(coopname, [&](auto &w) {
    w.id = get_global_id_in_scope(_capital, coopname, "withdraws"_n);
    w.coopname = coopname;
    w.withdraw_hash = withdraw_hash;
    w.commit_hashes = commit_hashes;
    w.result_hash = result_hash;
    w.project_hash = exist_result -> project_hash;
    w.username = username;
    w.amount = amount;
    w.contribution_statement = contribution_statement;
    w.return_statement = return_statement;
  });
};