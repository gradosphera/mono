void capital::approvedebt(eosio::name coopname, checksum256 debt_hash, document2 approved_statement)
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
    Action::send<createagenda_interface>(
      _soviet,
      "createagenda"_n,
      _capital,
      coopname,
      debt -> username, 
      get_valid_soviet_action("createdebt"_n),
      debt_hash, 
      _capital, 
      "debtauthcnfr"_n, 
      "declinedebt"_n, 
      debt -> statement, 
      std::string("")
    );

}
