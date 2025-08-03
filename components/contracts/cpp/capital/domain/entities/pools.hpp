#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;

namespace Capital {

/**
 * @brief Универсальная структура пулов для плановых и фактических показателей
 */
struct pools {
  
  // Стоимость часа
  eosio::asset hour_cost = asset(0, _root_govern_symbol);                 ///< Фактическая стоимость часа

  // Время создателей
  uint64_t creators_hours = 0;                                         ///< Время в часах (только для плана)
  
  // Коэффициент возврата себестоимости
  double return_cost_coefficient = 0.0;
  
  // Пул создателей (себестоимость создателей)
  eosio::asset creators_base_pool = asset(0, _root_govern_symbol);      
  
  // Пул авторов (авторская себестоимость авторов)
  eosio::asset authors_base_pool = asset(0, _root_govern_symbol);
  
  // Инвестиции, привлеченные координаторами
  eosio::asset coordinators_investment_pool = asset(0, _root_govern_symbol); 

  // Премии координаторов, которые будут распределены между координаторами
  eosio::asset coordinators_base_pool = asset(0, _root_govern_symbol);
  
  // Пул премий создателей
  eosio::asset creators_bonus_pool = asset(0, _root_govern_symbol);     
  
  // Пул премий авторов
  eosio::asset authors_bonus_pool = asset(0, _root_govern_symbol);     
  
  // Пул премий вкладчиков
  eosio::asset contributors_bonus_pool = asset(0, _root_govern_symbol); 
  
  // Пул расходов
  eosio::asset expenses_pool = asset(0, _root_govern_symbol);          ///< Расходы
  
  // Пул входящих инвестиций
  eosio::asset invest_pool = asset(0, _root_govern_symbol);            
  
  // CRPS поля для масштабируемого распределения
  uint64_t total_author_shares = 0;                         ///< Общее количество авторских долей в проекте
  uint64_t total_coordinator_shares = 0;                    ///< Общее количество координаторских долей в проекте
  uint64_t total_creator_shares = 0;                        ///< Общее количество создательских долей в проекте
  uint64_t total_investor_shares = 0;                       ///< Общее количество инвестрских долей в проекте
  uint64_t total_contributor_shares = 0;                    ///< Общее количество вкладчических долей в проекте
  int64_t author_base_cumulative_reward_per_share = 0;     ///< Накопительная базовая награда на авторскую долю  
  int64_t author_bonus_cumulative_reward_per_share = 0;    ///< Накопительная бонусная награда на авторскую долю
  int64_t coordinator_cumulative_reward_per_share = 0;     ///< Накопительная награда на координаторскую долю
  int64_t contributor_cumulative_reward_per_share = 0;     ///< Накопительная награда на вкладчическую долю
  
};

} // namespace Capital 