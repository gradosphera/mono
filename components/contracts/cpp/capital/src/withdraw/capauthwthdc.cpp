void capital::capauthwthdc(eosio::name coopname, uint64_t withdraw_id, document authorization) {
  require_auth(_soviet);
  
  capital_tables::withdraws_index withdraws(_capital, coopname.value);
  auto withdraw = withdraws.find(withdraw_id);
  eosio::check(withdraw != withdraws.end(), "Объект взноса-возврата не найден");

  withdraws.modify(withdraw, _capital, [&](auto &w){
    w.authorized_contribution_statement = authorization;
  });

  capital::try_finalize_withdrawal(coopname, withdraw);
}