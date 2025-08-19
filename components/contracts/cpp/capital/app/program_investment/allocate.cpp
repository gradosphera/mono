void capital::allocate(eosio::name coopname, checksum256 project_hash, eosio::asset amount) {
  require_auth(coopname);

  Wallet::validate_asset(amount);
  
  // Проверяем существование проекта
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  // Аллоцируем средства из глобального пула в проект
  Capital::Core::allocate_program_investment_to_project(coopname, project_hash, amount);
}