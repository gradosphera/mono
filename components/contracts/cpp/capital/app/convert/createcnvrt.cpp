/**
 * @brief 
 * 
 */
void capital::createcnvrt(
    eosio::name coopname,
    eosio::name application,
    eosio::name username,
    checksum256 project_hash,
    checksum256 convert_hash,
    document2 convert_statement
) {
    // Авторизация
    require_auth(coopname);

    // Проверяем, нет ли уже такой конвертации
    auto existing_convert = Capital::get_convert(coopname, convert_hash);
    eosio::check(!existing_convert.has_value(), "Объект конвертации с указанным хэшем уже существует");
    
    // Получаем контрибьютора
    auto exist_contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, project_hash, username);
    Capital::contributor_index contributors(_capital, coopname.value);
    auto contributor = contributors.find(exist_contributor->id);

    // Находим segment
    auto exist_segment = Capital::Circle::get_segment_or_fail(coopname, project_hash, username, "Объект актора в результате не найден");
   
    //=== Сумма к конвертации ===
    asset convert_amount = exist_segment.available + exist_segment.for_convert;
    eosio::check(convert_amount.amount > 0, "Нет доступных средств для конвертации");
    
    //=== Создаём запись в converts ===
    Capital::convert_index converts(_capital, coopname.value);
    uint64_t convert_id = get_global_id_in_scope(_capital, coopname, "converts"_n);
    
    converts.emplace(coopname, [&](auto &n) {
        n.id          = convert_id;
        n.username    = username;
        n.project_hash = project_hash;
        n.convert_hash = convert_hash;
        n.coopname    = coopname;
        n.status      = "created"_n;
        n.convert_amount = convert_amount;
        n.convert_statement = convert_statement;
    });
    
    Capital::Circle::segments_index segments(_capital, coopname.value);
    
    auto segment = segments.find(exist_segment.id);
    
    //обнуляем доступные средства к выводу или конвертации
    segments.modify(segment, coopname, [&](auto &ra) {
        ra.for_convert = asset(0, _root_govern_symbol);
        ra.available = asset(0, _root_govern_symbol);
    });
}
