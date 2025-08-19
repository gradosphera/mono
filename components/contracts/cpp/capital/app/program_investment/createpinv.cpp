void capital::createpinv(name coopname, name username, checksum256 invest_hash, asset amount, document2 statement) {
  require_auth(coopname);
  
  verify_document_or_fail(statement, {username});
  
  // Проверяем сумму инвестиции
  Wallet::validate_asset(amount);
  
  // Проверяем основной договор УХД
  auto contributor = Capital::Contributors::get_active_contributor_or_fail(coopname, username);
  
  // Проверяем наличие кошелька в программе капитализации (_capital_wallet)
  auto capital_wallet = Capital::get_capital_wallet(coopname, username);
  eosio::check(capital_wallet.has_value(), "У пайщика нет кошелька в программе капитализации");
  
  std::string memo = Capital::Memo::get_program_invest_memo(contributor -> id);
  
  // блокируем средства в кошельке пайщика
  Wallet::block_funds(_capital, coopname, contributor -> username, amount, _wallet_program, memo);

  // Создаем программную инвестицию и отправляем на approve
  Capital::ProgramInvests::create_program_invest_with_approve(coopname, username, invest_hash, amount, statement);
}