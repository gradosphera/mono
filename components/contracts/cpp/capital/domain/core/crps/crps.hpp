#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include "../../entities/generation_amounts.hpp"
#include "../../entities/projects.hpp"
#include "../../entities/segments.hpp"

using namespace eosio;

namespace Capital::Core {

  /**
   * @brief Обновляет CRPS поля в проекте для авторов при добавлении наград
   */
  void increment_authors_crps_in_project(eosio::name coopname, uint64_t project_id, 
                         const eosio::asset &base_reward, const eosio::asset &bonus_reward);

  /**
   * @brief Обновляет CRPS поля в проекте для участников при добавлении наград
   */
  void increment_contributors_crps_in_project(eosio::name coopname, uint64_t project_id, const eosio::asset &reward_amount);

  /**
   * @brief Обновляет сегмент участника - пересчитывает накопленные награды на основе CRPS
   */
  void refresh_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username);

  /**
   * @brief Пересчитывает доступную сумму к компенсации на основе инвестиций
   */
  void refresh_provisional_amount(eosio::name coopname, uint64_t segment_id, const Capital::project &project);

  /**
   * @brief Обновляет награды автора в сегменте
   */
  void refresh_author_segment(eosio::name coopname, uint64_t segment_id, const Capital::project &project);

  /**
   * @brief Обновляет награды координатора в сегменте  
   */
  void refresh_coordinator_segment(eosio::name coopname, uint64_t segment_id, const Capital::project &project);

  /**
   * @brief Обновляет награды участника в сегменте
   */
  void refresh_contributor_segment(eosio::name coopname, uint64_t segment_id, const Capital::project &project);

  /**
   * @brief Создает или обновляет запись создателя в таблице segments.
   */
  void upsert_creator_segment(eosio::name coopname, uint64_t segment_id, const Capital::project &project, 
                                     eosio::name username, const generation_amounts &delta_amounts);

  /**
   * @brief Создает или обновляет запись инвестора в таблице segments.
   */
  void upsert_investor_segment(eosio::name coopname, uint64_t segment_id, uint64_t project_id, 
                                     eosio::name username, const eosio::asset &investor_amount);

  /**
   * @brief Создает или обновляет запись автора в таблице segments.
   */
  void upsert_author_segment(eosio::name coopname, uint64_t segment_id, const Capital::project &project, 
                                    eosio::name username, uint64_t shares);

  /**
   * @brief Создает или обновляет запись координатора в таблице segments.
   */
  void upsert_coordinator_segment(eosio::name coopname, uint64_t segment_id, uint64_t project_id, 
                                         eosio::name username, const eosio::asset &rised_amount);

  /**
   * @brief Создает или обновляет запись пропертора с имущественным взносом в таблице segments.
   */
  void upsert_propertor_segment(eosio::name coopname, uint64_t segment_id, const Capital::project &project, 
                                     eosio::name username, const eosio::asset &property_amount);

  /**
   * @brief Создает или обновляет запись участника в таблице segments.
   */
  void upsert_contributor_segment(eosio::name coopname, uint64_t segment_id, const Capital::project &project, 
                                        eosio::name username);

  /**
   * @brief Функция распределения членских взносов на программу
   */
  void distribute_program_membership_funds(eosio::name coopname, asset amount);

  /**
   * @brief Обновляет программную CRPS для contributor
   */
  void refresh_contributor_program_rewards(eosio::name coopname, eosio::name username);

  /**
   * @brief Обрабатывает вывод средств из программы через contributor
   */
  void process_contributor_program_withdrawal(eosio::name coopname, eosio::name username, 
                                             asset amount, const std::string& memo);

  /**
   * @brief Добавляет средства в глобальный пул доступных инвестиций программы
   */
  void add_program_investment_funds(eosio::name coopname, asset amount);

  /**
   * @brief Аллоцирует средства из глобального пула в проект согласно правилу распределения
   */
  void allocate_program_investment_to_project(eosio::name coopname, uint64_t project_id, eosio::asset amount);

  /**
   * @brief Диаллоцирует средства из проекта обратно в глобальный пул (после закрытия проекта)
   */
  void deallocate_program_investment_from_project(eosio::name coopname, uint64_t project_id, eosio::asset amount);

  /**
   * @brief Обновляет фактически используемую сумму инвестора в сегменте с учетом коэффициента возврата
   */
  void update_investor_used_amount(eosio::name coopname, uint64_t segment_id, const Capital::project &project);

}