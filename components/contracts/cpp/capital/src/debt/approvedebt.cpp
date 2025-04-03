void capital::approvedebt(eosio::name coopname, checksum256 debt_hash, document approved_statement)
{
   require_auth(_soviet);

   debts_index debts(_capital, coopname.value);
   auto exist_debt = get_debt(coopname, debt_hash);
   eosio::check(exist_debt.has_value(), "Долг не найден");
   
   auto debt = debts.find(exist_debt -> id);
   
   debts.modify(debt, coopname, [&](auto& d) {
      d.status = "approved"_n;
      d.approved_statement = approved_statement;
   });
   
   //отправляем в совет
  action(permission_level{ _capital, "active"_n}, _soviet, "createagenda"_n,
    std::make_tuple(
      coopname,
      debt -> username, 
      get_valid_soviet_action("createdebt"_n),
      debt_hash, 
      _capital, 
      "debtauthcnfr"_n, //success_callback
      "declinedebt"_n, //decline_callback
      debt -> statement, 
      std::string("")
    )
  ).send();  
  
}
