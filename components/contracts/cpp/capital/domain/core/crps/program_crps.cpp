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
    // Проверяем что contributor существует
    auto contributor_opt = Capital::Contributors::get_contributor(coopname, username);
    if (!contributor_opt.has_value()) {
      return; // Contributor не найден
    }

    Capital::contributor_index contributors(_capital, coopname.value);
    auto contributor_it = contributors.get_index<"byusername"_n>();
    auto contributor = contributor_it.find(username.value);
    
    auto state = Capital::get_global_state(coopname);
    
    // Считаем дельту CRPS
    int64_t current_crps = state.program_membership_cumulative_reward_per_share;
    int64_t last_crps = contributor->reward_per_share_last;
    int64_t delta = current_crps - last_crps;

    eosio::asset share_balance = get_capital_user_share_balance(coopname, username);
    
    if (delta > 0 && share_balance.amount > 0) {
      // Начисляем вознаграждение
      eosio::asset reward_amount = eosio::asset(share_balance.amount * delta, _root_govern_symbol);
      
      contributor_it.modify(contributor, _capital, [&](auto &c) {
        c.capital_available += reward_amount;              
        c.reward_per_share_last = current_crps;
      });
    } else if (delta > 0) {
      // Обновляем last_crps даже если нет долей
      contributor_it.modify(contributor, _capital, [&](auto &c) {
        c.reward_per_share_last = current_crps;
      });
    }
  }

  /**
   * @brief Обрабатывает вывод средств из программы через contributor
   */
  void process_contributor_program_withdrawal(eosio::name coopname, eosio::name username, 
                                             asset amount, const std::string& memo) {
    // Проверяем что contributor существует
    auto contributor_opt = Capital::Contributors::get_contributor(coopname, username);
    eosio::check(contributor_opt.has_value(), "Участник не найден");

    // Проверяем достаточность накопленных средств
    eosio::check(contributor_opt->capital_available >= amount, 
                 "Недостаточно накопленных средств для создания запроса на возврат");

    Capital::contributor_index contributors(_capital, coopname.value);
    auto contributor_it = contributors.get_index<"byusername"_n>();
    auto contributor = contributor_it.find(username.value);

    // Обновление данных contributor - ТОЛЬКО уменьшаем capital_available, доли остаются неизменными!
    contributor_it.modify(contributor, _capital, [&](auto &c) {
      c.capital_available -= amount;
      // НЕ трогаем доли пайщика - они остаются неизменными
    });

    // Обновляем глобальное состояние - увеличиваем распределенную сумму
    auto state = Capital::get_global_state(coopname);
    state.program_membership_distributed += amount;
    state.program_membership_available -= amount;
    update_global_state(state);
  }

} // namespace Capital::Core