void capital::createdebt(name coopname, name username, checksum256 assignment_hash, checksum256 debt_hash, asset amount, time_point_sec repaid_at, document2 statement) {
  require_auth(coopname);
  
  verify_document_or_fail(statement);
  
  Wallet::validate_asset(amount);
  
  auto exist_assignment = get_assignment(coopname, assignment_hash);  
  eosio::check(exist_assignment.has_value(), "Задание не найдено");
  
  assignment_index assignments(_capital, coopname.value);
  auto assignment = assignments.find(exist_assignment -> id);
  
  eosio::check(assignment -> status == "opened"_n, "Только результаты в статусе opened могут быть основанием для выдачи ссуды");
  
  auto exist_contributor = get_active_contributor_or_fail(coopname, assignment -> project_hash, username);
  eosio::check(exist_contributor.has_value(), "Договор УХД с пайщиком не найден");
  
  contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  
  contributors.modify(contributor, coopname, [&](auto &c){
    c.debt_amount += amount;
  });
  
  auto exist_creauthor = get_creauthor(coopname, assignment_hash, username);
  eosio::check(exist_creauthor.has_value(), "Резактор не найден");
  
  creauthor_index creauthors(_capital, coopname.value);
  
  auto creauthor = creauthors.find(exist_creauthor->id);
  eosio::check(creauthor -> provisional_amount >= amount, "Недостаточно доступных средств для получения ссуды");
  
  creauthors.modify(creauthor, coopname, [&](auto &ra) {
      ra.debt_amount += amount;
      ra.provisional_amount -= amount;
  });
  
  auto exist_debt = get_debt(coopname, debt_hash);
  eosio::check(!exist_debt.has_value(), "Ссуда с указанным hash уже существует");
  
  debts_index debts(_capital, coopname.value);
  auto debt_id = get_global_id_in_scope(_soviet, coopname, "debts"_n);
  
  debts.emplace(coopname, [&](auto &d){
    d.id = debt_id;
    d.coopname = coopname;
    d.username = username;
    d.debt_hash = debt_hash;
    d.assignment_hash = assignment_hash;
    d.project_hash = assignment -> project_hash;
    d.amount = amount;
    d.statement = statement;
    d.repaid_at = repaid_at;
  });
  
  
  // Отправляем в совет approve-запрос
  action(
    permission_level{_capital, "active"_n}, // кто вызывает
    _soviet,
    "createapprv"_n,
    std::make_tuple(
      coopname,
      username,
      statement,
      debt_hash, // внешний ID
      _capital, // callback_contract (текущий контракт)
      "approvedebt"_n, // callback_action_approve
      "declinedebt"_n, // callback_action_decline
      std::string("") 
    )
  ).send();
  
}