#pragma once

#include <eosio/eosio.hpp>

using namespace eosio;

namespace Capital {

/**
 * @brief Структура для данных CRPS (Cumulative Reward Per Share) распределения наград
 * 
 * CRPS алгоритм с использованием double для точности:
 * 1. При добавлении награды: crps += награда / количество_долей
 * 2. При расчете награды: pending = доли_участника * (current_crps - last_crps)
 * 
 * Все CRPS поля используют double для высокой точности без проблем с overflow
 */
struct crps_data {
  // Общее количество долей участников (изменяется только при регистрации/обновлении долей участников)
  eosio::asset total_capital_contributors_shares = asset(0, _root_govern_symbol);                    ///< Сумма всех capital_contributor_shares зарегистрированных участников
  
  // Накопительные награды на долю (double для точности)
  double author_base_cumulative_reward_per_share = 0.0;     ///< Накопительная базовая награда на авторскую долю
  double author_bonus_cumulative_reward_per_share = 0.0;    ///< Накопительная бонусная награда на авторскую долю  
  double contributor_cumulative_reward_per_share = 0.0;     ///< Накопительная награда на вкладчическую долю
};

} // namespace Capital 