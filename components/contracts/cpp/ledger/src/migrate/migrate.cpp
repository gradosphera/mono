/**
 * @brief Миграция данных контракта
 * Переносит данные из контракта fund в счета ledger
 * @ingroup public_actions
 * @ingroup public_ledger_actions
 * @anchor ledger_migrate
 * @note Авторизация требуется от аккаунта: @p ledger
 */
void ledger::migrate(){
  require_auth(_ledger);
  
  // Получаем все кооперативы
  cooperatives2_index coops(_registrator, _registrator.value);
  
  for (auto coop_iter = coops.begin(); coop_iter != coops.end(); ++coop_iter) {
    eosio::name coopname = coop_iter->username;
    
    // Проверяем что счета еще не инициализированы
    laccounts_index accounts(_ledger, coopname.value);
    auto existing = accounts.begin();
    if (existing != accounts.end()) {
      continue; // Пропускаем уже мигрированные кооперативы
    }

    // Мигрируем данные из fund контракта
    // Читаем кошелек кооператива
    coopwallet_index coopwallets(_fund, coopname.value);
    auto wallet_iter = coopwallets.find(0); // ID всегда 0
    
    if (wallet_iter != coopwallets.end()) {
      // Паевой фонд (circulating_account) -> счет 80 (SHARE_FUND)
      if (wallet_iter->circulating_account.available.amount > 0) {
        Ledger::add(_ledger, coopname, Ledger::accounts::SHARE_FUND, 
                   wallet_iter->circulating_account.available, 
                   "Миграция: перенос паевого фонда");
      }

      // Вступительные взносы (initial_account) -> счет 861 (ENTRANCE_FEES)
      if (wallet_iter->initial_account.available.amount > 0) {
        Ledger::add(_ledger, coopname, Ledger::accounts::ENTRANCE_FEES, 
                   wallet_iter->initial_account.available, 
                   "Миграция: перенос вступительных взносов");
      }

      // Накопительный счет членских взносов (accumulative_expense_account) -> счет 86 (TARGET_RECEIPTS)
      if (wallet_iter->accumulative_expense_account.available.amount > 0) {
        Ledger::add(_ledger, coopname, Ledger::accounts::TARGET_RECEIPTS, 
                   wallet_iter->accumulative_expense_account.available, 
                   "Миграция: перенос накопительного счета членских взносов");
      }
    }
  }
} 