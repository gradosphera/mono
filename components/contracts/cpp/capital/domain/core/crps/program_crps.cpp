#include "crps.hpp"

using namespace eosio;
using std::string;

namespace Capital::Core {

  /**
   * @brief Функция распределения членских взносов на программу
   */
  void distribute_program_membership_funds(eosio::name coopname, asset amount) {
    eosio::asset total_shares = get_capital_program_share_balance(coopname);
        
    auto state = Capital::get_global_state(coopname);
    
    state.program_membership_funded += amount; 
    state.program_membership_available += amount;
    
    if (total_shares.amount > 0) {
          // Рассчитываем награду на долю в базовых единицах
    int64_t delta = amount.amount / total_shares.amount;
      state.program_membership_cumulative_reward_per_share += delta;
    }

    update_global_state(state);
  }

  /**
   * @brief Обновляет программную CRPS для contributor
   */
  void refresh_contributor_program_rewards(eosio::name coopname, eosio::name username) {
    // Проверяем, что у пользователя есть баланс в программе капитализации
    eosio::asset share_balance = get_capital_user_share_balance(coopname, username);
    
    eosio::check(share_balance.amount > 0, "Нет баланса в программе")
    
    // Получаем или создаём capital_wallet
    auto capital_wallet_opt = Capital::Wallets::get_capital_wallet_by_username(coopname, username);
    
    auto state = Capital::get_global_state(coopname);
    
    // Считаем дельту CRPS
    int64_t current_crps = state.program_membership_cumulative_reward_per_share;
    int64_t last_crps = capital_wallet_opt.has_value() ? capital_wallet_opt->last_program_crps : 0;
    int64_t delta = current_crps - last_crps;

    if (delta > 0 && share_balance.amount > 0) {
      // Начисляем вознаграждение
      eosio::asset reward_amount = eosio::asset(share_balance.amount * delta, _root_govern_symbol);
      
      if (capital_wallet_opt.has_value()) {
        // Обновляем существующий кошелёк через функцию сущности
        Capital::Wallets::update_capital_wallet(coopname, username, current_crps, reward_amount);
      } else {
        // Создаём новый кошелёк
        Capital::Wallets::upsert_capital_wallet(coopname, username, current_crps, reward_amount);
      }
    } else if (delta > 0) {
      // Обновляем last_crps даже если нет долей
      if (capital_wallet_opt.has_value()) {
        Capital::Wallets::update_capital_wallet(coopname, username, current_crps);
      } else {
        // Создаём новый кошелёк с обновлённым CRPS
        Capital::Wallets::upsert_capital_wallet(coopname, username, current_crps);
      }
    }
  }

  /**
   * @brief Обрабатывает вывод средств из программы через capital_wallet
   */
  void process_contributor_program_withdrawal(eosio::name coopname, eosio::name username, 
                                             asset amount, const std::string& memo) {
    // Проверяем что capital_wallet существует
    auto capital_wallet_opt = Capital::Wallets::get_capital_wallet_by_username(coopname, username);
    eosio::check(capital_wallet_opt.has_value(), "Кошелёк капитализации не найден");

    // Проверяем достаточность накопленных средств
    eosio::check(capital_wallet_opt->capital_available >= amount, 
                 "Недостаточно накопленных средств для создания запроса на возврат");

    // Обновление данных capital_wallet через функцию сущности
    eosio::asset negative_amount = eosio::asset(-amount.amount, amount.symbol);
    Capital::Wallets::update_capital_wallet(coopname, username, 0, negative_amount);

    // Обновляем глобальное состояние - увеличиваем распределенную сумму
    auto state = Capital::get_global_state(coopname);
    state.program_membership_distributed += amount;
    state.program_membership_available -= amount;
    update_global_state(state);
  }

} // namespace Capital::Core