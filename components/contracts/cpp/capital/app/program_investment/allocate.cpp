void capital::allocate(eosio::name coopname, eosio::name application, checksum256 project_hash, eosio::asset amount) {
  check_auth_or_fail(_capital, coopname, application, "allocateprog"_n);

  Wallet::validate_asset(amount);
  
  // Проверяем существование проекта
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  // Аллоцируем средства из глобального пула в проект
  Capital::Core::allocate_program_investment_to_project(coopname, project_hash, amount);
}