void capital::approvedebt(eosio::name coopname, checksum256 debt_hash, document2 approved_statement)
{
    require_auth(_soviet);

    // Получаем долг
    auto exist_debt = Capital::Debts::get_debt_or_fail(coopname, debt_hash);
    
    // Обновляем статус долга
    Capital::Debts::update_debt_status(coopname, debt_hash, Capital::Debts::Status::APPROVED, 
                                       _soviet, approved_statement);

    // Создаем агенду в совете
    Capital::Debts::create_debt_agenda(coopname, exist_debt.username, debt_hash, exist_debt.statement);
}
