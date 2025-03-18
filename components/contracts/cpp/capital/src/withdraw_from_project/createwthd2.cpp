void capital::createwthd2(name coopname, name application, name username, checksum256 project_hash, checksum256 withdraw_hash, asset amount, document return_statement) {
  check_auth_or_fail(_capital, coopname, application, "createwthd2"_n);

  verify_document_or_fail(return_statement);

  auto exist_project = get_project(coopname, project_hash);
  eosio::check(exist_project.has_value(), "Проект с указанным хэшем не найден");
  
  auto exist_contributor = capital::get_active_contributor_or_fail(coopname, project_hash, username);
  
  eosio::check(exist_contributor -> pending_rewards >= amount, "Недостаточно накопленных средств для создания запроса на возврат");

  contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  
  contributors.modify(contributor, coopname, [&](auto &c) {
    c.pending_rewards -= amount;
  });

  auto exist_withdraw = get_result_withdraw(coopname, withdraw_hash);
  
  eosio::check(!exist_withdraw.has_value(), "Заявка на взнос-возврат с таким хэшем уже существует");
  
  capital_tables::project_withdraws_index project_withdraws(_capital, coopname.value);
  
  project_withdraws.emplace(coopname, [&](auto &w) {
    w.id = get_global_id_in_scope(_capital, coopname, "withdraws2"_n);
    w.coopname = coopname;
    w.withdraw_hash = withdraw_hash;
    w.project_hash = project_hash;
    w.username = username;
    w.amount = amount;
    w.return_statement = return_statement;
  });
}
