void capital::debtpaycnfrm(name coopname, checksum256 debt_hash) {
  require_auth(_gateway);
  
  auto exist_debt = get_debt(coopname, debt_hash);
  eosio::check(exist_debt.has_value(), "Долг не найден");
    
  debts_index debts(_capital, coopname.value);
  auto debt = debts.find(exist_debt -> id);
  
  debts.erase(debt);
};