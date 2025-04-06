void capital::declinedebt(name coopname, checksum256 debt_hash, std::string reason) {
  //вызывается при отклонении советом или председателем из контракта совета
  require_auth(_gateway);

  auto exist_debt = get_debt(coopname, debt_hash);
  eosio::check(exist_debt.has_value(), "Долг не найден");
    
  debts_index debts(_capital, coopname.value);
  auto debt = debts.find(exist_debt -> id);

  auto exist_contributor = get_active_contributor_or_fail(coopname, debt -> project_hash, debt -> username);
  eosio::check(exist_contributor.has_value(), "Договор УХД с пайщиком не найден");
  
  contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  
  eosio::check(contributor -> debt_amount >= debt -> amount, "Возникла какая-то чудовищная ошибка: у пайщика недостаточно средств в долговом кошельке для того, чтобы принять возврат долга. Такого вообще не должно было быть, но если произошло, пожалуйста, срочно обратитесь в поддержку.");
  
  contributors.modify(contributor, coopname, [&](auto &c) {
    c.debt_amount -= debt -> amount;
  });
  
  auto exist_resactor = get_resactor(coopname, debt -> result_hash, debt -> username);
  eosio::check(exist_resactor.has_value(), "Резактор не найден");
  
  resactor_index resactors(_capital, coopname.value);
  auto resactor = resactors.find(exist_resactor->id);
  
  eosio::check(resactor -> provisional_amount >= debt -> amount, "Недостаточно доступных средств для получения ссуды");
  eosio::check(resactor -> debt_amount >= debt -> amount, "Возникла какая-то чудовищная ошибка: у пайщика недостаточно средств в долговом кошельке для того, чтобы принять возврат долга. Такого вообще не должно было быть, но если произошло, пожалуйста, срочно обратитесь в поддержку.");
  
  resactors.modify(resactor, coopname, [&](auto &ra) {
    ra.debt_amount -= debt -> amount;
    ra.provisional_amount += debt -> amount;
  });
  
  debts.erase(debt);
}