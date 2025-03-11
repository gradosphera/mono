void capital::wthdrcallbck(eosio::name coopname, eosio::name callback_type, checksum256 withdraw_hash) {
  auto payer = check_auth_and_get_payer_or_fail({ _gateway });

  // Обработка на основе типа callback_type
  switch(callback_type.value) {
    case "expense"_n.value: {
      // Логика для типа "expense"
      capital::expense_withdraw_callback(coopname, withdraw_hash);      
      break;
    }
    default: {
      // Обработка для неизвестных типов
      eosio::check(false, "Неизвестный тип коллбэка при обработке платежа"); 
      break;
    }
  }
}
