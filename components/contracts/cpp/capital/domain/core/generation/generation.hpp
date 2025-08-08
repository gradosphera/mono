#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include "../../entities/plan_pool.hpp"
#include "../../entities/fact_pool.hpp"
#include "../../entities/generation_amounts.hpp"

using namespace eosio;

namespace Capital::Core::Generation {

  /**
   * @brief Функция расчета плановых показателей проекта
   */
  plan_pool calculate_plan_generation_amounts(
    eosio::name coopname,
    const eosio::asset& plan_hour_cost,
    const uint64_t& plan_creators_hours,
    const eosio::asset& plan_expenses
  );
  
  /**
   * @brief Функция расчета премий вкладчиков (для фактических показателей)
   */
  eosio::asset calculate_contributors_bonus_pool(const fact_pool& fact);

  /**
   * @brief Функция расчета премий вкладчиков (для плановых показателей)
   */
  eosio::asset calculate_contributors_bonus_pool(const plan_pool& plan);

  /**
   * @brief Функция расчета фактических показателей генерации (по времени создателей)
   */
  generation_amounts calculate_fact_generation_amounts(eosio::asset rate_per_hour, uint64_t creator_hours);

  /**
   * @brief Функция расчета премий координаторов от инвестиций
   */
  eosio::asset calculate_coordinator_bonus_from_investment(name coopname, const eosio::asset& investment_amount);

  /**
   * @brief Функция расчета коэффициента возврата себестоимости (для фактических показателей)
   */
  double calculate_return_cost_coefficient(const fact_pool& current_pools);

  /**
   * @brief Функция расчета коэффициента возврата себестоимости (для плановых показателей)
   */
  double calculate_return_cost_coefficient(const plan_pool& current_pools);

  /**
   * @brief Распределение паевых средств проекта
   */
  void distribute_project_membership_funds(eosio::name coopname, uint64_t project_id, asset amount, uint8_t level);

  /**
   * @brief Рассчитывает фактически используемую сумму инвестора с учетом коэффициента возврата
   */
  eosio::asset calculate_investor_used_amount(const eosio::asset& investor_base, double return_cost_coefficient);

  /**
   * @brief Добавляет координаторские средства к проекту
   */
  void add_coordinator_funds(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &amount);

} // namespace Capital::Core 