void capital::capauthexpns(eosio::name coopname, uint64_t expense_id, document authorization) {
  require_auth(_soviet);
  
  expense_index expenses(_capital, coopname.value);
  auto expense = expenses.find(expense_id);
  
  eosio::check(expense != expenses.end(), "Расход не найден");
  
  auto contributor = get_active_contributor_or_fail(coopname, expense -> project_hash, expense -> username);
  eosio::check(contributor.has_value(), "Договор УХД с пайщиком по проекту не найден");
  
  //TODO: заменить плательщика на coopname
  expenses.modify(expense, _soviet, [&](auto &i) {
    i.status = "authorized"_n;
    i.authorization = authorization;
  });
  
  // создаём объект исходящего платежа в gateway с коллбэком после обработки
  action(permission_level{ _capital, "active"_n}, _gateway, _gateway_create_expense_withdraw_action,
    std::make_tuple(coopname, ""_n, expense -> username, expense -> expense_hash, expense -> amount, expense -> statement, _capital, _gateway_to_capital_expense_callback_type, std::string("")))
  .send();  

}