/**
 * @brief Инициировать программный расход через шасси expense.
 *
 * capital — только инициатор. Резервирует средства в @c program_expense_pool,
 * создаёт скелет записи progexpense (status=CREATED, как маркер pending), затем
 * шлёт inline action `expense::createexp(...)` с callback handler `{capital, onpgexpdone}`.
 * Шасси expense обслуживает весь дальнейший flow (авторизация совета, выдача аванса,
 * отчёт, закрытие либо отклонение) и на терминальном переходе шлёт inline `onpgexpdone`.
 *
 * @param coopname        Кооператив
 * @param expense_hash    Хеш расхода (= proposal_hash в шасси)
 * @param creator         Инициатор расхода
 * @param operation_code  o.exp.blgadv (аванс) либо o.exp.blgdir (прямая оплата)
 * @param items           Позиции СЗ (см. ExpenseDomain::item)
 * @param description     Описание для отчётности
 * @param statement       Документ-заявление (ProgramExpenseStatement)
 *
 * @ingroup public_actions
 * @ingroup public_capital_actions
 *
 * @note Авторизация требуется от @p coopname.
 */
void capital::createpgexp(name coopname, checksum256 expense_hash, name creator,
                          name operation_code,
                          std::vector<ExpenseDomain::item> items,
                          std::string description, document2 statement) {
  require_auth(coopname);

  verify_document_or_fail(statement);
  eosio::check(!items.empty(), "Программный расход должен содержать хотя бы один item");

  // Сумма расхода — сумма planned_amount всех items.
  asset amount = items.front().planned_amount;
  amount.amount = 0;
  for (const auto &it : items) {
    amount += it.planned_amount;
  }
  Wallet::validate_asset(amount);
  eosio::check(amount.amount > 0, "Сумма программного расхода должна быть положительной");

  auto exist = Capital::get_program_expense(coopname, expense_hash);
  eosio::check(!exist.has_value(), "Программный расход с указанным хэшем уже существует");

  // Резерв в пуле до отправки в шасси — две параллельные заявки не превысят пул.
  Capital::State::reserve_program_expense(coopname, amount);

  Capital::Expenses::create_program_expense(coopname, expense_hash, creator,
                                            amount, description, statement);

  // Inline action в шасси expense с callback handler на capital::onpgexpdone.
  // data пустой — capital резолвит запись по expense_hash, дополнительный payload не нужен.
  ExpenseDomain::callback_handler callback{
    .contract = _capital,
    .action   = Names::Capital::Callbacks::ON_PROGRAM_EXPENSE_DONE,
    .data     = std::vector<char>{}
  };

  eosio::action(
    eosio::permission_level{coopname, "active"_n},
    _expense,
    Names::External::CREATE_EXPENSE_PROPOSAL,
    std::make_tuple(coopname, creator, expense_hash, operation_code,
                    ledger2_wallets::BLAGOROST_FUND, items, callback, statement)
  ).send();
}
