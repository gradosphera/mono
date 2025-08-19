void capital::declinedebt(name coopname, checksum256 debt_hash, std::string reason) {
  //вызывается при отклонении советом или председателем из контракта совета
  require_auth(_gateway);

  // Получаем долг
  auto exist_debt = Capital::Debts::get_debt_or_fail(coopname, debt_hash);

  // Получаем участника
  auto exist_contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, exist_debt.project_hash, exist_debt.username);
  eosio::check(exist_contributor.has_value(), "Договор УХД с пайщиком не найден");
  
  // Уменьшаем debt_amount в сегменте
  auto exist_segment = Capital::Segments::get_segment(coopname, exist_debt.project_hash, exist_debt.username);
  eosio::check(exist_segment.has_value(), "Сегмент не найден");
  
  // Уменьшаем debt_amount в сегменте
  Capital::Segments::decrease_debt_amount(coopname, exist_segment->id, exist_debt.amount);
  
  // Удаляем долг
  Capital::Debts::delete_debt(coopname, debt_hash);
}