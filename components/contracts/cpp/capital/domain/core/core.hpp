#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include "../entities/pools.hpp"

using namespace eosio;

namespace Capital::Core {

  /**
   * @brief Распределяет авторские средства между всеми авторами проекта пропорционально их долям.
   */
  void distribute_author_rewards(eosio::name coopname, const checksum256 &project_hash, const pools &delta_pools);

  /**
   * @brief Функция расчета плановых показателей проекта
   */
  pools calculate_plan_generation_amounts(
    const eosio::asset& plan_hour_cost,
    const uint64_t& plan_creators_hours,
    const eosio::asset& plan_expenses
  );
  
  /**
   * @brief Функция расчета премий вкладчиков
   */
  eosio::asset calculate_contributors_bonus_pool(const pools& fact);

  /**
   * @brief Функция расчета фактических показателей генерации (по времени создателей)
   */
  pools calculate_fact_generation_amounts(eosio::asset rate_per_hour, uint64_t creator_hours);

  /**
   * @brief Функция расчета премий координаторов от инвестиций
   */
  eosio::asset calculate_coordinator_bonus_from_investment(const eosio::asset& investment_amount);

  /**
   * @brief Функция расчета коэффициента возврата себестоимости
   */
  double calculate_return_cost_coefficient(const pools& current_pools);

  /**
   * @brief Получение баланса паевых взносов по программе капитализации
   */
  int64_t get_capital_program_share_balance(eosio::name coopname);

  /**
   * @brief Получение баланса паевых взносов пользователя в программе капитализации
   */
  int64_t get_capital_user_share_balance(eosio::name coopname, eosio::name username);

  /**
   * @brief Распределение паевых средств проекта
   */
  void distribute_project_membership_funds(eosio::name coopname, uint64_t project_id, asset amount, uint8_t level);

} // namespace Capital::Core 