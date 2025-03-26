void capital::capauthwthd1(eosio::name coopname, uint64_t withdraw_id, document authorization) {
  require_auth(_soviet);
  
  //Получаем объект возврата
  capital_tables::result_withdraws_index result_withdraws(_capital, coopname.value);
  auto withdraw = result_withdraws.find(withdraw_id);
  eosio::check(withdraw != result_withdraws.end(), "Объект взноса-возврата не найден");
  
  auto exist_contributor = capital::get_active_contributor_or_fail(coopname, withdraw -> project_hash, withdraw -> username);
  auto exist_result = get_result_or_fail(coopname, withdraw -> result_hash, "Результат не найден");
  
  // списание с УХД
  std::string memo_out = "Зачёт части целевого паевого взноса по договору УХД с ID: " + std::to_string(exist_contributor -> id) + " в качестве паевого взноса по программе 'Цифровой Кошелёк'";

  // списываем с кошелька программы генерации при договоре УХД
  Wallet::sub_blocked_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _source_program, memo_out);
  
  // добавление в кошелёк
  Wallet::add_available_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _wallet_program, memo_out);
  
  result_withdraws.erase(withdraw);
}