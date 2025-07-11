void capital::debtpaydcln(name coopname, checksum256 debt_hash, std::string reason) {
  require_auth(_gateway);
  
  auto exist_debt = get_debt(coopname, debt_hash);
  eosio::check(exist_debt.has_value(), "Долг не найден");

  debts_index debts(_capital, coopname.value);
  auto debt = debts.find(exist_debt -> id);
  
  //Удаляем объект долга в контракте loan
  Action::send<settledebt_interface>(
    _loan,
    "settledebt"_n,
    _capital,
    coopname, 
    debt -> username, 
    debt -> debt_hash, 
    debt -> amount
  );
    
  debts.erase(debt);
};