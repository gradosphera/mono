//действие вызывается советом как коллбэк при положительном решении по вопросу выдачи ссуд
//вызывает контракт шлюза для регистрации исходящего платежа
void capital::debtauthcnfr(eosio::name coopname, checksum256 debt_hash, document2 decision) {
    require_auth(_soviet);
  
    // Получаем долг
    auto exist_debt = Capital::Debts::get_debt_or_fail(coopname, debt_hash);
    
    // Обновляем статус долга
    Capital::Debts::update_debt_status(coopname, debt_hash, Capital::Debts::Status::AUTHORIZED, 
                                       _capital, decision);
    
    //Создаём объект долга в контракте loan
    Action::send<createdebt_interface>(
      _loan,
      Names::External::CREATE_DEBT,
      _capital,
      coopname, 
      exist_debt.username, 
      exist_debt.debt_hash, 
      exist_debt.repaid_at,
      exist_debt.amount
    );
    
    // создаём объект исходящего платежа в gateway с коллбэком после обработки
    Action::send<createoutpay_interface>(
      _gateway,
      Names::External::CREATE_OUTPAY,
      _capital,
      coopname, 
      exist_debt.username, 
      exist_debt.debt_hash, 
      exist_debt.amount, 
      _capital, 
      Names::Capital::CONFIRM_DEBT_PAYMENT, 
      Names::Capital::DECLINE_DEBT
    );
};