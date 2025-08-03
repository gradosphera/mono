#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include "../../entities/pools.hpp"

using namespace eosio;

namespace Capital::Core {

  /**
   * @brief Обновляет CRPS поля в проекте для авторов при добавлении наград
   */
  void increment_authors_crps_in_project(eosio::name coopname, const checksum256 &project_hash, 
                         const eosio::asset &base_reward, const eosio::asset &bonus_reward);

  /**
   * @brief Обновляет CRPS поля в проекте для координаторов при добавлении наград
   */
  void update_coordinator_crps(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &reward_amount);

  /**
   * @brief Обновляет CRPS поля в проекте для вкладчиков при добавлении наград
   */
  void update_contributor_crps(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &reward_amount);

  /**
   * @brief Обновляет сегмент участника - пересчитывает накопленные награды на основе CRPS
   */
  void refresh_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username);

  /**
   * @brief Пересчитывает доступную сумму к компенсации на основе инвестиций
   */
  void refresh_provisional_amount(eosio::name coopname, const checksum256 &project_hash, eosio::name username);

  /**
   * @brief Обновляет награды автора в сегменте
   */
  void refresh_author_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username);

  /**
   * @brief Обновляет награды координатора в сегменте  
   */
  void refresh_coordinator_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username);

  /**
   * @brief Обновляет награды вкладчика в сегменте
   */
  void refresh_contributor_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username);

  /**
   * @brief Создает или обновляет запись создателя в таблице segments.
   */
  void upsert_creator_segment(eosio::name coopname, const checksum256 &project_hash, 
                                     eosio::name username, const pools &delta_pools);

  /**
   * @brief Создает или обновляет запись инвестора в таблице segments.
   */
  void upsert_investor_segment(eosio::name coopname, const checksum256 &project_hash, 
                                     eosio::name username, const eosio::asset &investor_amount);

  /**
   * @brief Создает или обновляет запись автора в таблице segments.
   */
  void upsert_author_segment(eosio::name coopname, const checksum256 &project_hash, 
                                    eosio::name username, uint64_t shares);

  /**
   * @brief Создает или обновляет запись координатора в таблице segments.
   */
  void upsert_coordinator_segment(eosio::name coopname, const checksum256 &project_hash, 
                                         eosio::name coordinator_username, const eosio::asset &rised_amount);

  /**
   * @brief Создает или обновляет запись вкладчика в таблице segments.
   */
  void upsert_contributor_segment(eosio::name coopname, const checksum256 &project_hash, 
                                        eosio::name username);

}