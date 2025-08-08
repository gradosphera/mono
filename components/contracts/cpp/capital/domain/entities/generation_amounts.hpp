#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;

namespace Capital {

/**
 * @brief Структура для результатов расчета генерации коммита
 * Содержит только те поля, которые рассчитываются при создании коммита
 */
struct generation_amounts {
  // Основные параметры коммита
  eosio::asset hour_cost = asset(0, _root_govern_symbol);         ///< Стоимость часа для коммита
  
  // Количество часов создателей в коммите
  uint64_t creators_hours = 0;                                   ///< Количество часов создателей в коммите
  
  // Рассчитанные суммы себестоимостей
  eosio::asset creators_base_pool = asset(0, _root_govern_symbol);  ///< Себестоимость создателей за коммит
  eosio::asset authors_base_pool = asset(0, _root_govern_symbol);   ///< Авторская себестоимость за коммит
  
  // Рассчитанные суммы премий
  eosio::asset creators_bonus_pool = asset(0, _root_govern_symbol); ///< Премии создателей за коммит
  eosio::asset authors_bonus_pool = asset(0, _root_govern_symbol);  ///< Премии авторов за коммит
  
  // Общая сумма генерации коммита
  eosio::asset total_generation_pool = asset(0, _root_govern_symbol); ///< Общая сумма генерации коммита
  
  // Премии вкладчиков рассчитываются от total_generation_pool
  eosio::asset contributors_bonus_pool = asset(0, _root_govern_symbol); ///< Премии вкладчиков за коммит
  
  // Общая сумма вкладов всех пайщиков
  eosio::asset total_contribution = asset(0, _root_govern_symbol); ///< Общая сумма вкладов всех пайщиков
  
  // Общая сумма вкладов с расходами
  eosio::asset total = asset(0, _root_govern_symbol); ///< Общая сумма вкладов с расходами
  
};

} // namespace Capital 