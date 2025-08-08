void capital::createdebt(name coopname, name username, checksum256 project_hash, checksum256 debt_hash, asset amount, time_point_sec repaid_at, document2 statement) {
  require_auth(coopname);
  
  verify_document_or_fail(statement);
  Wallet::validate_asset(amount);
  
  // Проверяем что участник существует в проекте
  auto exist_contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, project_hash, username);
  eosio::check(exist_contributor.has_value(), "Договор УХД с пайщиком не найден");
  
  // Проверяем что сегмент существует и обновлен
  auto exist_segment = Capital::Segments::get_segment(coopname, project_hash, username);
  eosio::check(exist_segment.has_value(), "Сегмент не найден");
  
  // Проверяем что сегмент обновлен (CRPS актуален)
  Capital::Segments::check_segment_is_updated(coopname, project_hash, username, 
    "Сегмент не обновлен. Выполните rfrshsegment перед получением ссуды");
  
  // Проверяем доступность средств для ссуды
  eosio::check(exist_segment -> provisional_amount >= amount, "Недостаточно доступных средств для получения ссуды");
  eosio::check((exist_segment -> debt_amount + amount) <= exist_segment->provisional_amount, 
    "Сумма долга не может превышать доступную сумму залога");
  
  // Обновляем debt_amount у участника в программе капитализации
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist_contributor->id);
  
  contributors.modify(contributor, coopname, [&](auto &c){
    c.debt_amount += amount;
  });
  
  // Обновляем debt_amount в сегменте (НЕ уменьшаем provisional_amount)
  Capital::Segments::segments_index segments(_capital, coopname.value);
  auto segment = segments.find(exist_segment->id);
  
  segments.modify(segment, coopname, [&](auto &s) {
      s.debt_amount += amount;
  });
  
  // Создаем долг в таблице
  Capital::Debts::create_debt(coopname, username, project_hash, debt_hash, amount, repaid_at, statement);
  
  // Создаем аппрув для долга
  Capital::Debts::create_debt_approval(coopname, username, debt_hash, statement);
  
}