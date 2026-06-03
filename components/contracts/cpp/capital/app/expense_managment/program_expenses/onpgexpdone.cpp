/**
 * @brief Callback от шасси expense на финализацию program-расхода.
 *
 * Вызывается inline из самого capital (require_auth(_capital)) когда шасси
 * expense закончило flow (closeexp или declexp). capital не делает ledger2-проводок —
 * они уже сделаны шасси на payexp/reportexp/returnexp. capital только обновляет
 * @c program_expense_pool и удаляет запись из @c progexpenses.
 *
 *   status == ExpenseDomain::ProposalStatus::CLOSED (4):
 *     consume_program_expense(total_actual) + release_program_expense(reserved - total_actual) +
 *     delete progexpense.
 *   status == ExpenseDomain::ProposalStatus::DECLINED (5):
 *     release_program_expense(reserved) + delete progexpense.
 *
 * @param coopname     Кооператив
 * @param expense_hash Хеш расхода (ключ в progexpenses)
 * @param status       ExpenseDomain::ProposalStatus
 * @param total_actual Фактически потраченная сумма (для CLOSED)
 * @param data         Произвольный payload от инициатора (не используется на MVP)
 *
 * @ingroup public_actions
 * @ingroup public_capital_actions
 *
 * @note Авторизация требуется от @p _capital — это inline self-callback от шасси.
 */
void capital::onpgexpdone(name coopname, checksum256 expense_hash, uint8_t status,
                          eosio::asset total_actual, std::vector<char> data) {
  require_auth(_capital);

  auto pgexp = Capital::Expenses::get_program_expense_or_fail(coopname, expense_hash);
  const auto reserved = pgexp.amount;

  if (status == static_cast<uint8_t>(ExpenseDomain::ProposalStatus::CLOSED)) {
    eosio::check(total_actual.symbol == reserved.symbol,
                 "Символ total_actual не совпадает с зарезервированной суммой");
    eosio::check(total_actual.amount >= 0,
                 "total_actual не может быть отрицательным");
    eosio::check(total_actual.amount <= reserved.amount,
                 "total_actual превышает зарезервированную сумму программного расхода");

    if (total_actual.amount > 0) {
      Capital::State::consume_program_expense(coopname, total_actual);
    }
    const asset leftover = reserved - total_actual;
    if (leftover.amount > 0) {
      Capital::State::release_program_expense(coopname, leftover);
    }
  } else if (status == static_cast<uint8_t>(ExpenseDomain::ProposalStatus::DECLINED)) {
    Capital::State::release_program_expense(coopname, reserved);
  } else {
    eosio::check(false, "onpgexpdone принимает только статусы CLOSED либо DECLINED");
  }

  Capital::Expenses::delete_program_expense(coopname, pgexp.id);
}
