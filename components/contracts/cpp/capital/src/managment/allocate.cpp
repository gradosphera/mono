void capital::allocate(eosio::name coopname, eosio::name application, checksum256 project_hash, checksum256 result_hash, eosio::asset amount) {
  check_auth_or_fail(_capital, coopname, application, "allocate"_n);

  Wallet::validate_asset(amount);
  
  auto project = get_project(coopname, project_hash);
  eosio::check(project.has_value(), "Проект с указанным хэшем не найден");
    
  auto result = get_result(coopname, result_hash);
  eosio::check(result.has_value(), "Объект результата не найден");
  eosio::check(project -> available >= amount, "Недостаточно средств в проекте для аллокации в результат");
        
  project_index projects(_capital, coopname.value);
  auto project_for_modify = projects.find(project -> id);
  
  projects.modify(project_for_modify, coopname, [&](auto& row) {
    row.available -= amount;
    row.allocated += amount;
  });
  
  result_index results(_capital, coopname.value);
  auto result_for_modify = results.find(result -> id);
  
  results.modify(result_for_modify, coopname, [&](auto& row) {
    row.allocated += amount;
    row.available += amount;
  });
};