void wallet::declinedpst(eosio::name coopname, checksum256 deposit_hash, std::string reason) {
  require_auth(_gateway);
  
  auto exist_deposit = Wallet::get_deposit(coopname, deposit_hash);
  eosio::check(exist_deposit.has_value(), "Объект паевого взноса не найден");
  
  Wallet::deposits_index deposits(_wallet, coopname.value);
  auto deposit = deposits.find(exist_deposit -> id);
  
  //оповещаем пользователя
  require_recipient(deposit -> username);  
  
  deposits.erase(deposit);

  //TODO: нужно везде убрать обход правил проверки доступного баланса в кошельке и паевом фонде
  //subbal и subcirculate (они здесь срабатывали ранее а больше не будут)
}