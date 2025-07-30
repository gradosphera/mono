void wallet::completedpst(eosio::name coopname, checksum256 deposit_hash) {
  require_auth(_gateway);
  
  auto cooperative = get_cooperative_or_fail(coopname);
  
  auto exist_deposit = Wallet::get_deposit(coopname, deposit_hash);
  eosio::check(exist_deposit.has_value(), "Объект паевого взноса не найден");
  
  Wallet::deposits_index deposits(_wallet, coopname.value);
  auto deposit = deposits.find(exist_deposit -> id);
  
  auto participant = get_participant_or_fail(coopname, deposit -> username);

  std::string memo = "Паевой взнос по целевой потребительской программе 'Цифровой Кошелёк'";
  Wallet::add_available_funds(_wallet, coopname, deposit -> username, deposit ->quantity, _wallet_program, memo);

  Ledger::debet(_wallet, coopname, Ledger::accounts::SHARE_FUND, deposit -> quantity, memo);
  
  //оповещаем пользователя
  require_recipient(deposit -> username);  
  
  deposits.erase(deposit);
}