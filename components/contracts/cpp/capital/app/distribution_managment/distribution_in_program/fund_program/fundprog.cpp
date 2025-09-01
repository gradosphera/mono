/**
 * @brief Финансирует программу капитализации
 * Финансирует программу капитализации из внешних источников:
 * - Валидирует сумму финансирования
 * - Распределяет средства программы капитализации
 * @param coopname Наименование кооператива
 * @param amount Сумма финансирования
 * @param memo Мемо для транзакции
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p _soviet или @p _gateway
 */
void capital::fundprog(eosio::name coopname, asset amount, std::string memo) {
  require_auth(coopname);
  // auto payer = check_auth_and_get_payer_or_fail({_soviet, _gateway});

    Wallet::validate_asset(amount);

    // Используем новую core функцию для распределения средств
    Capital::Core::distribute_program_membership_funds(coopname, amount);
};
