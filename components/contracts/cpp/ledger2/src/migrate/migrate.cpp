/**
 * @brief Миграция данных контракта
 * Инициализирует расчетный счет по сумме паевых и вступительных взносов
 * @ingroup public_actions
 * @ingroup public_ledger_actions

 * @note Авторизация требуется от аккаунта: @p ledger
 */
void ledger::migrate(){
  require_auth(_ledger);

  // Получаем все кооперативы
  cooperatives2_index coops(_registrator, _registrator.value);

  for (auto coop_iter = coops.begin(); coop_iter != coops.end(); ++coop_iter) {
    eosio::name coopname = coop_iter->username;

    // Работаем со счетами кооператива
    laccounts_index accounts(_ledger, coopname.value);

    // Получаем текущий баланс расчетного счета
    auto bank_account = accounts.find(Ledger::accounts::BANK_ACCOUNT);
    eosio::asset current_bank_balance = eosio::asset(0, _root_govern_symbol);

    if (bank_account != accounts.end()) {
      current_bank_balance = bank_account->available;
    }

    // Если расчетный счет пустой, пересчитываем его
    if (current_bank_balance.amount == 0) {
      // Получаем баланс паевого фонда
      auto share_fund = accounts.find(Ledger::accounts::SHARE_FUND);
      eosio::asset share_fund_balance = eosio::asset(0, _root_govern_symbol);
      if (share_fund != accounts.end()) {
        share_fund_balance = share_fund->available;
      }

      // Получаем баланс вступительных взносов
      auto entrance_fees = accounts.find(Ledger::accounts::ENTRANCE_FEES);
      eosio::asset entrance_fees_balance = eosio::asset(0, _root_govern_symbol);
      if (entrance_fees != accounts.end()) {
        entrance_fees_balance = entrance_fees->available;
      }

      // Новая сумма для расчетного счета
      eosio::asset new_bank_balance = share_fund_balance + entrance_fees_balance;

      if (new_bank_balance.amount > 0) {
        checksum256 empty_hash;
        memset(&empty_hash, 0, sizeof(empty_hash));
        
        Ledger::add(_ledger, coopname, Ledger::accounts::BANK_ACCOUNT,
                   new_bank_balance,
                   "Миграция: инициализация расчетного счета по сумме паевых и вступительных взносов",
                   empty_hash, coopname);
      }
    }
  }
} 