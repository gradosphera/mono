void capital::declinedebt(name coopname, checksum256 debt_hash, std::string reason) {
  //вызывается при отклонении советом или председателем из контракта совета
  require_auth(_gateway);

  auto exist_debt = Capital::get_debt(coopname, debt_hash);
  eosio::check(exist_debt.has_value(), "Долг не найден");
    
  Capital::debts_index debts(_capital, coopname.value);
  auto debt = debts.find(exist_debt -> id);

  auto exist_contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, debt -> project_hash, debt -> username);
  eosio::check(exist_contributor.has_value(), "Договор УХД с пайщиком не найден");
  
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor -> id);
  
  eosio::check(contributor -> debt_amount >= debt -> amount, "Возникла какая-то чудовищная ошибка: у пайщика недостаточно средств в долговом кошельке для того, чтобы принять возврат долга. Такого вообще не должно было быть, но если произошло, пожалуйста, срочно обратитесь в поддержку.");
  
  contributors.modify(contributor, coopname, [&](auto &c) {
    c.debt_amount -= debt -> amount;
  });
  
  auto exist_segment = Capital::Circle::get_segment(coopname, debt -> project_hash, debt -> username);
  eosio::check(exist_segment.has_value(), "Резактор не найден");
  
  Capital::Circle::segments_index segments(_capital, coopname.value);
  auto segment = segments.find(exist_segment->id);
  
  eosio::check(segment -> provisional_amount >= debt -> amount, "Недостаточно доступных средств для получения ссуды");
  eosio::check(segment -> debt_amount >= debt -> amount, "Возникла какая-то чудовищная ошибка: у пайщика недостаточно средств в долговом кошельке для того, чтобы принять возврат долга. Такого вообще не должно было быть, но если произошло, пожалуйста, срочно обратитесь в поддержку.");
  
  segments.modify(segment, coopname, [&](auto &ra) {
    ra.debt_amount -= debt -> amount;
    ra.provisional_amount += debt -> amount;
  });
  
  debts.erase(debt);
}