void capital::capauthwthd1(eosio::name coopname, checksum256 withdraw_hash, document2 authorization) {
  require_auth(_soviet);
  
  //Получаем объект возврата
  auto exist_withdraw = Capital::get_result_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект возврата не найден");
  
  Capital::result_withdraws_index result_withdraws(_capital, coopname.value);
  auto withdraw = result_withdraws.find(exist_withdraw -> id);
  
  auto exist_contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, withdraw->project_hash, withdraw -> username);
  
  // списание с УХД
  std::string memo_out = Capital::Memo::get_result_withdraw_memo(exist_contributor -> id);

  // списываем с кошелька программы генерации при договоре УХД
  Wallet::sub_blocked_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _source_program, memo_out);
  
  // добавление в кошелёк
  Wallet::add_available_funds(_capital, coopname, withdraw -> username, withdraw -> amount, _wallet_program, memo_out);
  
  result_withdraws.erase(withdraw);
}