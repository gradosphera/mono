void capital::capdeclwthd2(name coopname, checksum256 withdraw_hash, std::string reason) {
  require_auth(_soviet);
  
  auto exist_withdraw = Capital::get_project_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект возврата не найден");
  
  Capital::project_withdraws_index project_withdraws(_capital, coopname.value);
  auto withdraw = project_withdraws.find(exist_withdraw -> id);
  
  // Возвращаем available средства в проект, так как запрос на возврат отклонен
  Capital::Projects::add_membership_available(coopname, withdraw->project_hash, withdraw->amount);
  
  project_withdraws.erase(withdraw);
}