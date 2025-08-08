#pragma once

#include <eosio/eosio.hpp>

using namespace eosio;

namespace Capital {

/**
 * @brief Структура для данных CRPS (Cumulative Reward Per Share) распределения наград
 */
struct crps_data {
  // Общее количество долей вкладчиков
  eosio::asset total_capital_contributors_shares = asset(0, _root_govern_symbol);                    ///< Общее количество долей вкладчиков в проекте
  
  // Накопительные награды на долю
  int64_t author_base_cumulative_reward_per_share = 0;     ///< Накопительная базовая награда на авторскую долю  
  int64_t author_bonus_cumulative_reward_per_share = 0;    ///< Накопительная бонусная награда на авторскую долю
  int64_t coordinator_cumulative_reward_per_share = 0;     ///< Накопительная награда на координаторскую долю
  int64_t contributor_cumulative_reward_per_share = 0;     ///< Накопительная награда на вкладчическую долю
};

} // namespace Capital 