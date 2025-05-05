//действие вызывается советом как коллбэк при положительном решении по вопросу выдачи ссуд
//вызывает контракт шлюза для регистрации исходящего платежа
void capital::debtauthcnfr(eosio::name coopname, checksum256 debt_hash, document2 decision) {
    require_auth(_soviet);
  
    auto exist_debt = get_debt(coopname, debt_hash);
    eosio::check(exist_debt.has_value(), "Долг не найден");

    debts_index debts(_capital, coopname.value);
    auto debt = debts.find(exist_debt -> id);
    debts.modify(debt, _capital, [&](auto &d){
      d.status = "authorized"_n;
      d.authorization = decision;  
    });
    
    //Создаём объект долга в контракте loan
    Action::send<createdebt_interface>(
      _loan,
      "createdebt"_n,
      _capital,
      coopname, 
      debt -> username, 
      debt -> debt_hash, 
      debt -> repaid_at,
      debt -> amount
    );
    
    // создаём объект исходящего платежа в gateway с коллбэком после обработки
    Action::send<createoutpay_interface>(
      _gateway,
      "createoutpay"_n,
      _capital,
      coopname, 
      debt -> username, 
      debt -> debt_hash, 
      debt -> amount, 
      _capital, 
      "debtpaycnfrm"_n, 
      "dclnauthdebt"_n
    );


};