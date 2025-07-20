void capital::convtowallet(eosio::name coopname, eosio::name application, eosio::name username, checksum256 result_hash, asset amount, document2 convert_statement) {
    require_auth(coopname);
    
    verify_document_or_fail(convert_statement);
    Wallet::validate_asset(amount);
    
    // Получаем результат
    auto result = get_result(coopname, result_hash);
    eosio::check(result.has_value(), "Результат не найден");
    eosio::check(result->username == username, "Результат принадлежит другому пользователю");
    eosio::check(result->status == "act2"_n, "Результат должен быть в статусе act2");
    
    // Проверяем что сумма не превышает available_for_return
    eosio::check(amount <= result->available_for_return, "Сумма превышает доступную к возврату");
    
    // Обновляем результат
    result_index results(_capital, coopname.value);
    auto result_itr = results.find(result->id);
    
    results.modify(result_itr, coopname, [&](auto &r) {
        r.available_for_return -= amount;
    });
    
    // Конвертируем средства из программы УХД в ЦПП "Цифровой Кошелёк"
    std::string memo = "Конвертация паевого взноса по программе УХД в ЦПП 'Цифровой Кошелёк'";
    Wallet::convert_between_programs(_capital, coopname, username, amount, _capital_program, _wallet_program, memo);
} 