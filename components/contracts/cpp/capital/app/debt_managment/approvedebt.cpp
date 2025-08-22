/**
 * @brief Одобряет долг в проекте
 * Одобряет долг в проекте и создает повестку в совете:
 * - Получает долг
 * - Обновляет статус долга на approved
 * - Создает повестку в совете для рассмотрения долга
 * @param coopname Наименование кооператива
 * @param debt_hash Хеш долга для одобрения
 * @param approved_statement Одобренное заявление о долге
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p _soviet
 */
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
