#include "crps.hpp"

using namespace eosio;
using std::string;

namespace Capital::Core {

  /**
   * @brief Функция распределения членских взносов на программу
   */
  void distribute_program_membership_funds(eosio::name coopname, asset amount) {
    eosio::asset total_shares = get_capital_program_share_balance(coopname);
        
    auto state = Capital::State::get_global_state(coopname);
    
    state.program_membership_funded += amount; 
    state.program_membership_available += amount;
    
    if (total_shares.amount > 0) {
      // Используем масштаб 10^14 для высокой точности
      uint128_t amount_128 = static_cast<uint128_t>(amount.amount);
      uint128_t shares_128 = static_cast<uint128_t>(total_shares.amount);
      uint128_t precision_factor = 100000000000000ULL; // 10^14
      
      uint128_t delta_scaled = (amount_128 * precision_factor) / shares_128;
      state.program_membership_cumulative_reward_per_share += static_cast<double>(delta_scaled);
    }

    Capital::State::update_global_state(state);
  }

  /**
   * @brief Обновляет программную CRPS для contributor
   */
  void refresh_contributor_program_rewards(eosio::name coopname, eosio::name username) {
    // Проверяем, что у пользователя есть баланс в программе капитализации
    eosio::asset share_balance = get_capital_program_user_share_balance(coopname, username);
    
    eosio::check(share_balance.amount > 0, "Нет баланса в программе");
    
    // Получаем или создаём capital_wallet
    auto capital_wallet_opt = Capital::Wallets::get_capital_wallet_by_username(coopname, username);
    
    auto state = Capital::State::get_global_state(coopname);
    
    // Считаем дельту CRPS
    double current_crps = state.program_membership_cumulative_reward_per_share;
    double last_crps = capital_wallet_opt.has_value() ? capital_wallet_opt->last_program_crps : 0.0;
    double delta = current_crps - last_crps;

    if (delta > 0.0) {
      // Рассчитываем вознаграждение с масштабом 10^14
      uint128_t balance_128 = static_cast<uint128_t>(share_balance.amount);
      uint128_t delta_128 = static_cast<uint128_t>(delta);
      uint128_t precision_factor = 100000000000000ULL; // 10^14
      
      // Округляем при делении
      uint128_t numerator = balance_128 * delta_128;
      uint128_t pending_reward_128 = (numerator + precision_factor / 2) / precision_factor;
      int64_t pending_reward = static_cast<int64_t>(pending_reward_128);
      
      if (pending_reward > 0) {
        eosio::asset reward_amount = eosio::asset(pending_reward, _root_govern_symbol);
        Capital::Wallets::upsert_capital_wallet(coopname, username, current_crps, reward_amount);
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
    Capital::Wallets::upsert_capital_wallet(coopname, username, 0, negative_amount);

    // Обновляем глобальное состояние - увеличиваем распределенную сумму
    auto state = Capital::State::get_global_state(coopname);
    state.program_membership_distributed += amount;
    state.program_membership_available -= amount;
    Capital::State::update_global_state(state);
  }

} // namespace Capital::Core
