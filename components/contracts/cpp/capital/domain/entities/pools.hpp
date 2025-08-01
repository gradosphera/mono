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
  
};

} // namespace Capital 