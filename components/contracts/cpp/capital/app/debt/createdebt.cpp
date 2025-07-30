void capital::createdebt(name coopname, name username, checksum256 assignment_hash, checksum256 debt_hash, asset amount, time_point_sec repaid_at, document2 statement) {
  require_auth(coopname);
  
  verify_document_or_fail(statement);
  
  Wallet::validate_asset(amount);
  
  auto exist_assignment = Capital::get_assignment(coopname, assignment_hash);  
  eosio::check(exist_assignment.has_value(), "Задание не найдено");
  
  Capital::assignment_index assignments(_capital, coopname.value);
  auto assignment = assignments.find(exist_assignment -> id);
  
  eosio::check(assignment -> status == "opened"_n, "Только результаты в статусе opened могут быть основанием для выдачи ссуды");
  
  auto exist_contributor = Capital::get_active_contributor_with_appendix_or_fail(coopname, assignment -> project_hash, username);
  eosio::check(exist_contributor.has_value(), "Договор УХД с пайщиком не найден");
  
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  
  contributors.modify(contributor, coopname, [&](auto &c){
    c.debt_amount += amount;
  });
  
  auto exist_creauthor = Capital::get_creauthor(coopname, assignment_hash, username);
  eosio::check(exist_creauthor.has_value(), "Резактор не найден");
  
  Capital::creauthor_index creauthors(_capital, coopname.value);
  
  auto creauthor = creauthors.find(exist_creauthor->id);
  eosio::check(creauthor -> provisional_amount >= amount, "Недостаточно доступных средств для получения ссуды");
  
  creauthors.modify(creauthor, coopname, [&](auto &ra) {
      ra.debt_amount += amount;
      ra.provisional_amount -= amount;
  });
  
  auto exist_debt = Capital::get_debt(coopname, debt_hash);
  eosio::check(!exist_debt.has_value(), "Ссуда с указанным hash уже существует");
  
  Capital::debts_index debts(_capital, coopname.value);
  auto debt_id = get_global_id_in_scope(_capital, coopname, "debts"_n);
  
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
  
  Action::send<createapprv_interface>(
    _soviet,
    "createapprv"_n,
    _capital,
    coopname,
    username,
    statement,
    ApprovesNames::Capital::CREATE_DEBT,
    debt_hash,
    _capital,
    "approvedebt"_n,
    "declinedebt"_n,
    std::string("")
  );
  
  
}