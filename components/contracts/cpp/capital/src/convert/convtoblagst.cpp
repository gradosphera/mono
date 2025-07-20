void capital::convtoblagst(eosio::name coopname, eosio::name application, eosio::name username, checksum256 result_hash, asset amount, document2 convert_statement) {
    require_auth(coopname);
    
    verify_document_or_fail(convert_statement);
    Wallet::validate_asset(amount);
    
    // Получаем результат
    auto result = get_result(coopname, result_hash);
    eosio::check(result.has_value(), "Результат не найден");
    eosio::check(result->username == username, "Результат принадлежит другому пользователю");
    eosio::check(result->status == "act2"_n, "Результат должен быть в статусе act2");
    
    // Проверяем что есть доступные средства для конвертации в Благорост
    eosio::asset total_available_for_convert = result->available_for_return + result->available_for_convert;
    eosio::check(amount <= total_available_for_convert, "Сумма превышает доступную к конвертации");
    
    // Сначала используем available_for_return, потом available_for_convert
    eosio::asset from_return = eosio::asset(0, amount.symbol);
    eosio::asset from_convert = eosio::asset(0, amount.symbol);
    
    if (result->available_for_return.amount > 0) {
        from_return = std::min(amount, result->available_for_return);
        amount -= from_return;
    }
    
    if (amount.amount > 0) {
        from_convert = std::min(amount, result->available_for_convert);
    }
    
    // Обновляем результат
    result_index results(_capital, coopname.value);
    auto result_itr = results.find(result->id);
    
    results.modify(result_itr, coopname, [&](auto &r) {
        r.available_for_return -= from_return;
        r.available_for_convert -= from_convert;
    });
    
    eosio::asset total_converted = from_return + from_convert;
    
    // Конвертируем средства из программы УХД в ЦПП "Благорост"
    // С этого момента пайщик начинает получать капитализацию от последующих взносов
    std::string memo = "Конвертация паевого взноса по программе УХД в ЦПП 'Благорост'";
    Wallet::convert_between_programs(_capital, coopname, username, total_converted, _capital_program, _capital_program, memo);
    
    // Обновляем баланс пайщика в программе капитализации
    auto capitalist = get_capitalist(coopname, username);
    if (!capitalist.has_value()) {
        // Создаём нового капиталиста
        capital_tables::capitalist_index capitalists(_capital, coopname.value);
        capitalists.emplace(coopname, [&](auto &c) {
            c.username = username;
            c.coopname = coopname;
            c.pending_rewards = asset(0, _root_govern_symbol);
            c.returned_rewards = asset(0, _root_govern_symbol);
            c.reward_per_share_last = 0;
        });
    }
} 