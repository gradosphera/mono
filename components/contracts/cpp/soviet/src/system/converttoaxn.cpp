void soviet::converttoaxn(eosio::name coopname, eosio::asset amount, document2 statement) {
  require_auth(_provider);

  // Проверяем заявление
  verify_document_or_fail(statement, {coopname});
  Document::validate_registry_id(statement, 51);

  // Проверяем, что сумма положительная
  eosio::check(amount.amount > 0, "Сумма должна быть положительной");

  // Проверяем символ - должен быть _root_govern_symbol (RUB)
  eosio::check(amount.symbol == _root_govern_symbol, "Неверный символ токена. Ожидается RUB");

  // Конвертируем по курсу 10:1 (10 RUB = 1 AXON)
  int64_t axon_amount = amount.amount / 10;
  eosio::check(axon_amount > 0, "После конвертации сумма AXON должна быть положительной");

  eosio::asset axon_quantity(axon_amount, _root_symbol);

  // Списываем RUB с кошелька provider (_wallet_program)
  Wallet::sub_available_funds(_soviet, _provider, coopname, amount, _wallet_program, "Конвертация RUB в AXON");

  
  // Пополняем кошелёк членских взносов в ledger
  std::string memo = "Членский взнос из числа средств паевого взноса по соглашению о подключении к платформе Кооперативной Экономики от пайщика с username=" + coopname.to_string();
  
  // Уменьшаем паевой кошелёк провайдера
  checksum256 hash = statement.hash;
  
  Ledger::sub(_soviet, _provider, Ledger::accounts::SHARE_FUND, amount, memo, hash, coopname);

  Ledger::add(_soviet, _provider, Ledger::accounts::DELEGATE_FEES_FUND, amount, memo, hash, coopname);

  // Вызываем инъекцию AXON токенов на кооператив
  action(
      permission_level{ _soviet, "active"_n },
      _system,
      "injection"_n,
      std::make_tuple(coopname, axon_quantity)
  ).send();

  // Фиксируем документ в реестре
  Soviet::make_complete_document(
      _soviet,
      coopname,
      coopname,
      Names::Soviet::CONVERT_TO_AXON,
      hash,
      statement
  );
  
}
