void capital::declinedebt(name coopname, checksum256 debt_hash, std::string reason) {
  //вызывается при отклонении советом или председателем из контракта совета
  require_auth(_gateway);

  // Получаем долг
  auto exist_debt = Capital::Debts::get_debt_or_fail(coopname, debt_hash);

  // Получаем участника
  auto exist_contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, exist_debt.project_hash, exist_debt.username);
  eosio::check(exist_contributor.has_value(), "Договор УХД с пайщиком не найден");
  
  // Уменьшаем debt_amount у участника в программе капитализации
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor->id);
  
  eosio::check(contributor->debt_amount >= exist_debt.amount, "Ошибка: у пайщика недостаточно средств в долговом кошельке");
  
  contributors.modify(contributor, coopname, [&](auto &c) {
    c.debt_amount -= exist_debt.amount;
  });
  
  // Уменьшаем debt_amount в сегменте (НЕ увеличиваем provisional_amount)
  auto exist_segment = Capital::Segments::get_segment(coopname, exist_debt.project_hash, exist_debt.username);
  eosio::check(exist_segment.has_value(), "Сегмент не найден");
  
  Capital::Segments::segments_index segments(_capital, coopname.value);
  auto segment = segments.find(exist_segment->id);
  
  eosio::check(segment->debt_amount >= exist_debt.amount, "Ошибка: у пайщика недостаточно средств в долговом кошельке сегмента");
  
  segments.modify(segment, coopname, [&](auto &s) {
    s.debt_amount -= exist_debt.amount;
    });
  
  // Обновляем статус долга
  Capital::Debts::update_debt_status(coopname, debt_hash, Capital::Debts::Status::DECLINED, 
                                     _gateway, document2{}, reason);
  
  // Удаляем долг
  Capital::Debts::delete_debt(coopname, debt_hash);
}