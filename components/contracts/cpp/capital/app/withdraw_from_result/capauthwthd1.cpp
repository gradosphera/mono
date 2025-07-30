void capital::capauthwthd1(eosio::name coopname, checksum256 withdraw_hash, document2 authorization) {
  require_auth(_soviet);
  
  //Получаем объект возврата
  auto exist_withdraw = Capital::get_result_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект возврата не найден");
  
  Capital::result_withdraws_index result_withdraws(_capital, coopname.value);
  auto withdraw = result_withdraws.find(exist_withdraw -> id);
  
  auto exist_assignment = Capital::get_assignment_or_fail(coopname, withdraw -> assignment_hash, "Задание не найдено");
  auto exist_contributor = Capital::get_active_contributor_with_appendix_or_fail(coopname, exist_assignment.project_hash, withdraw -> username);
  
  // списание с УХД
  std::string memo_out = "Зачёт части целевого паевого взноса по договору УХД с ID: " + std::to_string(exist_contributor -> id) + " в качестве паевого взноса по программе 'Цифровой Кошелёк'";

  // списываем с кошелька программы генерации при договоре УХД
  Wallet::sub_blocked_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _source_program, memo_out);
  
  // добавление в кошелёк
  Wallet::add_available_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _wallet_program, memo_out);
  
  result_withdraws.erase(withdraw);
}