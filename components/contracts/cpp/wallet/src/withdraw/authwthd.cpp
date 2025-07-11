void wallet::authwthd(eosio::name coopname, checksum256 withdraw_hash) {
  require_auth(_soviet);
  
  auto exist_withdraw = Wallet::get_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект возврата с указанным хэшем не найден");
  
  Wallet::withdraws_index withdraws(_wallet, coopname.value);
  
  auto withdraw = withdraws.find(exist_withdraw -> id);
  eosio::check(withdraw != withdraws.end(), "Объект процессинга не найден");
  
  withdraws.modify(withdraw, _soviet, [&](auto &d){
    d.status = "authorized"_n;
  });
  
  // создаём объект исходящего платежа в gateway с коллбэком после обработки
  Action::send<createoutpay_interface>(
    _gateway,
    "createoutpay"_n,
    _wallet,
    coopname, 
    withdraw -> username, 
    withdraw_hash, 
    withdraw -> quantity, 
    _wallet, 
    Wallet::get_valid_wallet_action("completewthd"_n), 
    Wallet::get_valid_wallet_action("declinewthd"_n)
  );
}
