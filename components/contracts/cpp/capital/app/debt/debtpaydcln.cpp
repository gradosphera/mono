void capital::debtpaydcln(name coopname, checksum256 debt_hash, std::string reason) {
  require_auth(_gateway);
  
  // Получаем долг
  auto exist_debt = Capital::Debts::get_debt_or_fail(coopname, debt_hash);
  
  // Обновляем статус долга
  Capital::Debts::update_debt_status(coopname, debt_hash, Capital::Debts::Status::DECLINED, 
                                     _gateway, document2{}, reason);
  
  //Удаляем объект долга в контракте loan
  Action::send<settledebt_interface>(
    _loan,
    Names::External::SETTLE_DEBT,
    _capital,
    coopname, 
    exist_debt.username, 
    exist_debt.debt_hash, 
    exist_debt.amount
  );
    
  // Удаляем долг 
  Capital::Debts::delete_debt(coopname, debt_hash);
};