#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;

namespace Capital {

/**
 * @brief Структура фактических показателей проекта
 */
struct fact_pool {
  // Стоимость часа и время создателей
  eosio::asset hour_cost = asset(0, _root_govern_symbol);                 ///< Фактическая стоимость часа
  uint64_t creators_hours = 0;                                           ///< Фактическое время в часах

  // Коэффициенты возврата (в процентах)
  double return_base_percent = 0.0;                                  ///< Коэффициент возврата себестоимости для создателей/авторов/координаторов (0-100%)
  double use_invest_percent = 0.0;                                ///< Коэффициент используемых инвестиций для инвесторов (0-100%)
  
  // Пулы себестоимостей
  eosio::asset creators_base_pool = asset(0, _root_govern_symbol);        ///< Фактическая себестоимость создателей
  eosio::asset authors_base_pool = asset(0, _root_govern_symbol);         ///< Фактическая авторская себестоимость
  eosio::asset coordinators_base_pool = asset(0, _root_govern_symbol);    ///< Фактические премии координаторов
  eosio::asset property_base_pool = asset(0, _root_govern_symbol);        ///< Фактическая стоимость внесенного имущества
  
  // Пулы премий
  eosio::asset creators_bonus_pool = asset(0, _root_govern_symbol);       ///< Фактические премии создателей
  eosio::asset authors_bonus_pool = asset(0, _root_govern_symbol);        ///< Фактические премии авторов
  eosio::asset contributors_bonus_pool = asset(0, _root_govern_symbol);   ///< Фактические премии вкладчиков
  
  // Поля для управления расходами (только в фактических показателях)
  eosio::asset target_expense_pool = asset(0, _root_govern_symbol);       ///< Целевой размер расходов (копируется из плана)
  eosio::asset accumulated_expense_pool = asset(0, _root_govern_symbol);  ///< Фактически накопленные средства для расходов
  eosio::asset used_expense_pool = asset(0, _root_govern_symbol);         ///< Фактически израсходованные средства
  
  // Пулы инвестиций
  eosio::asset invest_pool = asset(0, _root_govern_symbol);               ///< Фактические инвестиции от инвесторов (после вычета расходов)
  eosio::asset coordinators_investment_pool = asset(0, _root_govern_symbol); ///< Фактические инвестиции, привлеченные координаторами
  eosio::asset program_invest_pool = asset(0, _root_govern_symbol);       ///< Фактические программные инвестиции, аллоцированные в проект
  eosio::asset total_received_investments = asset(0, _root_govern_symbol); ///< Общая сумма всех полученных инвестиций (до распределения)
  eosio::asset total_returned_investments = asset(0, _root_govern_symbol); ///< Общая сумма возвращенных неиспользованных инвестиций
  
  // Общая сумма генерации (без вкладчиков)
  eosio::asset total_generation_pool = asset(0, _root_govern_symbol);     ///< Общая фактическая сумма генерации
  
  // Общая сумма вкладов всех пайщиков (генерация + премии вкладчиков)
  eosio::asset total_contribution = asset(0, _root_govern_symbol); ///< Общая сумма вкладов всех пайщиков
  
  // Общая сумма генерации (с вкладчиками)  
  eosio::asset total = asset(0, _root_govern_symbol); ///< Общая фактическая сумма генерации с вкладчиками
};

} // namespace Capital 