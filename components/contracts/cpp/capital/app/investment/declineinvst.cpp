void capital::declineinvst(eosio::name coopname, checksum256 invest_hash, document2 decline_statement) {
  require_auth(_soviet);

  // Получаем инвестицию
  auto invest = Capital::Invests::get_invest_or_fail(coopname, invest_hash);
  
  std::string memo = Capital::Memo::get_decline_invest_memo();

  // Разблокируем средства в программе кошелька
  Wallet::sub_blocked_funds(_capital, coopname, invest.username, invest.amount, _wallet_program, memo);

  // Удаляем инвестицию
  Capital::Invests::delete_invest(coopname, invest_hash);
} 