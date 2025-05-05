void capital::capauthexpns(eosio::name coopname, checksum256 expense_hash, document2 authorization) {
  require_auth(_soviet);
  
  auto exist_expense = get_expense(coopname, expense_hash);
  eosio::check(exist_expense.has_value(), "Расход не найден");
  
  expense_index expenses(_capital, coopname.value);
  auto expense = expenses.find(exist_expense -> id);
  
  auto contributor = get_active_contributor_or_fail(coopname, expense -> project_hash, expense -> username);
  eosio::check(contributor.has_value(), "Договор УХД с пайщиком по проекту не найден");
  
  //TODO: заменить плательщика на coopname
  expenses.modify(expense, _soviet, [&](auto &i) {
    i.status = "authorized"_n;
    i.authorization = authorization;
  });
  
  // создаём объект исходящего платежа в gateway с коллбэком после обработки
  action(permission_level{ _capital, "active"_n}, _gateway, "createoutpay"_n,
    std::make_tuple(
      coopname, 
      expense -> username, 
      expense -> expense_hash, 
      expense -> amount, 
      _capital, 
      "exppaycnfrm"_n, 
      "capdeclexpns"_n
    )
  ).send();  

}