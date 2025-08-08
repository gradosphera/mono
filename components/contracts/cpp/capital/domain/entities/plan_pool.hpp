#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;

namespace Capital {

/**
 * @brief Структура плановых показателей проекта
 */
struct plan_pool {
  // Стоимость часа и время создателей
  eosio::asset hour_cost = asset(0, _root_govern_symbol);                 ///< Планируемая стоимость часа
  uint64_t creators_hours = 0;                                           ///< Планируемое время в часах

  // Коэффициент возврата себестоимости
  double return_cost_coefficient = 0.0;
  
  // Пулы себестоимостей
  eosio::asset creators_base_pool = asset(0, _root_govern_symbol);        ///< Планируемая себестоимость создателей
  eosio::asset authors_base_pool = asset(0, _root_govern_symbol);         ///< Планируемая авторская себестоимость
  eosio::asset coordinators_base_pool = asset(0, _root_govern_symbol);    ///< Планируемые премии координаторов
  
  // Пулы премий
  eosio::asset creators_bonus_pool = asset(0, _root_govern_symbol);       ///< Планируемые премии создателей
  eosio::asset authors_bonus_pool = asset(0, _root_govern_symbol);        ///< Планируемые премии авторов
  eosio::asset contributors_bonus_pool = asset(0, _root_govern_symbol);   ///< Планируемые премии вкладчиков
  
  // Пул расходов (только планируемый размер)
  eosio::asset target_expense_pool = asset(0, _root_govern_symbol);       ///< Планируемый размер расходов
  
  // Пулы инвестиций
  eosio::asset invest_pool = asset(0, _root_govern_symbol);               ///< Планируемые инвестиции
  eosio::asset coordinators_investment_pool = asset(0, _root_govern_symbol); ///< Планируемые инвестиции от координаторов
  eosio::asset program_invest_pool = asset(0, _root_govern_symbol);       ///< Планируемые программные инвестиции
  
  // Общая сумма генерации (без вкладчиков)
  eosio::asset total_generation_pool = asset(0, _root_govern_symbol);     ///< Общая планируемая сумма генерации
  
  // Общая сумма генерации (с вкладчиками)
  eosio::asset total = asset(0, _root_govern_symbol); ///< Общая планируемая сумма генерации с вкладчиками
};

} // namespace Capital 