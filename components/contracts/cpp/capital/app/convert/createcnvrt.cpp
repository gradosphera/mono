/**
 * @brief 
 * 
 */
void capital::createcnvrt(
    eosio::name coopname,
    eosio::name application,
    eosio::name username,
    checksum256 assignment_hash,
    checksum256 convert_hash,
    document2 convert_statement
) {
    // Авторизация
    require_auth(coopname);

    // Получаем задание (или кидаем ошибку)
    auto exist_assignment = Capital::get_assignment_or_fail(coopname, assignment_hash, "Задание не найдено");
    eosio::check(exist_assignment.status == "closed"_n, "Распределение стоимости задания еще не начато");
    
    // Проверяем, нет ли уже такой конвертации
    auto existing_convert = Capital::get_convert(coopname, convert_hash);
    eosio::check(!existing_convert.has_value(), "Объект конвертации с указанным хэшем уже существует");
    
    // Находим запись в таблице assignments
    Capital::assignment_index assignments(_capital, coopname.value);
    auto assignment = assignments.find(exist_assignment.id);
    
    // Получаем контрибьютора
    auto exist_contributor = Capital::get_active_contributor_or_fail(coopname, exist_assignment.project_hash, username);
    Capital::contributor_index contributors(_capital, coopname.value);
    auto contributor = contributors.find(exist_contributor->id);

    // Находим creauthor
    auto exist_creauthor = Capital::get_creauthor_or_fail(coopname, assignment_hash, username, "Объект актора в результате не найден");
   
    //=== Сумма к конвертации ===
    asset convert_amount = exist_creauthor.available + exist_creauthor.for_convert;
    eosio::check(convert_amount.amount > 0, "Нет доступных средств для конвертации");
    
    //=== Создаём запись в converts ===
    Capital::convert_index converts(_capital, coopname.value);
    uint64_t convert_id = get_global_id_in_scope(_capital, coopname, "converts"_n);
    
    converts.emplace(coopname, [&](auto &n) {
        n.id          = convert_id;
        n.username    = username;
        n.project_hash = exist_assignment.project_hash;
        n.assignment_hash = assignment_hash;
        n.convert_hash = convert_hash;
        n.coopname    = coopname;
        n.status      = "created"_n;
        n.convert_amount = convert_amount;
        n.convert_statement = convert_statement;
    });
    
    eosio::check(assignment -> creators_base_remain >= convert_amount, "Недостаточно средств в assignment.creators_base_remain для конвертации");

    assignments.modify(assignment, coopname, [&](auto &r) {
        r.creators_base_remain -= convert_amount;
    });
    
    Capital::creauthor_index creathors(_capital, coopname.value);
    
    auto creauthor = creathors.find(exist_creauthor.id);
    
    //обнуляем доступные средства к выводу или конвертации
    creathors.modify(creauthor, coopname, [&](auto &ra) {
        ra.for_convert = asset(0, _root_govern_symbol);
        ra.available = asset(0, _root_govern_symbol);
    });
}
