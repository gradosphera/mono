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
   * @brief Функция расчета премий участников (для фактических показателей)
   */
  eosio::asset calculate_contributors_bonus_pool(const fact_pool& fact);

  /**
   * @brief Функция расчета премий участников (для плановых показателей)
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
  double calculate_return_base_percent(eosio::asset creators_base_pool, eosio::asset authors_base_pool, eosio::asset coordinators_base_pool, eosio::asset invest_pool);

  /**
   * @brief Функция расчета коэффициента используемых инвестиций для плановых показателей
   */
  double calculate_use_invest_percent_planned(eosio::asset creators_base_pool, eosio::asset authors_base_pool, eosio::asset coordinators_base_pool, eosio::asset target_expense_pool, eosio::asset total_received_investments);
  
  /**
   * @brief Функция расчета коэффициента используемых инвестиций для фактических показателей
   */
  double calculate_use_invest_percent(eosio::asset creators_base_pool, eosio::asset authors_base_pool, eosio::asset coordinators_base_pool, eosio::asset accumulated_expense_pool, eosio::asset used_expense_pool, eosio::asset total_received_investments);

  /**
   * @brief Распределение паевых средств проекта
   */
  void distribute_project_membership_funds(eosio::name coopname, uint64_t project_id, asset amount, uint8_t level);

  /**
   * @brief Рассчитывает фактически используемую сумму инвестора с учетом коэффициента использования
   */
  eosio::asset calculate_investor_used_amount(const eosio::asset& investor_amount, double use_invest_percent);

  /**
   * @brief Добавляет координаторские средства к проекту
   */
  void add_coordinator_funds(eosio::name coopname, uint64_t project_id, const eosio::asset &amount);

} // namespace Capital::Core 