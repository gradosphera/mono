void capital::capauthwthdc(eosio::name coopname, uint64_t withdraw_id, document authorization) {
  require_auth(_soviet);
  
  capital_tables::result_withdraws_index result_withdraws(_capital, coopname.value);
  auto withdraw = result_withdraws.find(withdraw_id);
  eosio::check(withdraw != result_withdraws.end(), "Объект взноса-возврата не найден");

  result_withdraws.modify(withdraw, _capital, [&](auto &w){
    w.authorized_contribution_statement = authorization;
  });

  capital::try_finalize_withdrawal(coopname, withdraw);
}