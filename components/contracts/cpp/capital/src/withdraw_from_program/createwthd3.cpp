void capital::createwthd3(name coopname, name application, name username, checksum256 project_hash, checksum256 withdraw_hash, asset amount, document return_statement) {
  check_auth_or_fail(_capital, coopname, application, "createwthd3"_n);

  verify_document_or_fail(return_statement);

  auto exist_project = get_project(coopname, project_hash);
  eosio::check(exist_project.has_value(), "Проект с указанным хэшем не найден");
  
  capital_tables::participant_index participants(_capital, coopname.value);
  auto participant = participants.find(username.value);
  
  eosio::check(participant -> pending_rewards >= amount, "Недостаточно накопленных средств для создания запроса на возврат");

  participants.modify(participant, coopname, [&](auto &c) {
    c.pending_rewards -= amount;
  });

  auto exist_withdraw = get_program_withdraw(coopname, withdraw_hash);
  
  eosio::check(!exist_withdraw.has_value(), "Заявка на возврат с таким хэшем уже существует");
  
  capital_tables::program_withdraws_index program_withdraws(_capital, coopname.value);
  
  program_withdraws.emplace(coopname, [&](auto &w) {
    w.id = get_global_id_in_scope(_capital, coopname, "withdraws3"_n);
    w.coopname = coopname;
    w.withdraw_hash = withdraw_hash;
    w.username = username;
    w.amount = amount;
    w.return_statement = return_statement;
  });
}
