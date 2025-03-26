void capital::createcnvrt(
    eosio::name coopname,
    eosio::name application,
    eosio::name username,
    checksum256 result_hash,
    checksum256 convert_hash,
    document convert_statement
) {
    // Авторизация
    check_auth_or_fail(_capital, coopname, application, "createcnvrt"_n);

    // Получаем результат (или кидаем ошибку)
    auto exist_result = get_result_or_fail(coopname, result_hash, "Результат не найден");
    eosio::check(exist_result.status == "opened"_n || exist_result.status == "created"_n, "Распределение стоимости результата еще не начато или уже завершено");
    
    // Проверяем, нет ли уже такой конвертации
    auto existing_convert = get_convert(coopname, convert_hash);
    eosio::check(!existing_convert.has_value(), "Объект конвертации с указанным хэшем уже существует");
    
    // Находим запись в таблице results
    result_index results(_capital, coopname.value);
    auto result = results.find(exist_result.id);
    
    // Получаем контрибьютора
    auto exist_contributor = get_active_contributor_or_fail(coopname, exist_result.project_hash, username);
    contributor_index contributors(_capital, coopname.value);
    auto contributor = contributors.find(exist_contributor->id);

    // Попробуем найти resactor
    auto exist_resactor = get_resactor_or_fail(coopname, result_hash, username, "Объект актора в результате не найден");
   
    //=== Сумма к конвертации ===
    asset convert_amount = exist_resactor.available + exist_resactor.for_convert;
    eosio::check(convert_amount.amount > 0, "Нет доступных средств для конвертации");
    
    //=== Создаём запись в converts ===
    convert_index converts(_capital, coopname.value);
    uint64_t convert_id = get_global_id_in_scope(_capital, coopname, "converts"_n);
    
    converts.emplace(coopname, [&](auto &n) {
        n.id          = convert_id;
        n.username    = username;
        n.project_hash = exist_result.project_hash;
        n.result_hash = result_hash;
        n.convert_hash = convert_hash;
        n.coopname    = coopname;
        n.status      = "created"_n;
        n.convert_amount = convert_amount;
        n.convert_statement = convert_statement;
    });
    
    eosio::check(result -> creators_amount_remain >= convert_amount, "Недостаточно средств в result.creators_amount_remain для конвертации");

    results.modify(result, coopname, [&](auto &r) {
        r.creators_amount_remain -= convert_amount;
    });
    
    resactor_index ractors(_capital, coopname.value);
    
    auto resactor = ractors.find(exist_resactor.id);
    
    //обнуляем доступные средства к выводу или конвертации
    ractors.modify(resactor, coopname, [&](auto &ra) {
        ra.for_convert = asset(0, _root_govern_symbol);
        ra.available = asset(0, _root_govern_symbol);
    });
}
