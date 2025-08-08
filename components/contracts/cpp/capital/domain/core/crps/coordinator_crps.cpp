#include "crps.hpp"

namespace Capital::Core {

  /**
   * @brief Обновляет CRPS поля в проекте для координаторов при добавлении наград
   */
  inline void update_coordinator_crps(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &reward_amount) {
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      if (p.counts.total_coordinators > 0) {
        // Рассчитываем дельту reward per share
        int64_t delta = reward_amount.amount / p.counts.total_coordinators;
        p.crps.coordinator_cumulative_reward_per_share += delta;
      }
    });
  }

  
/**
 * @brief Создает или обновляет запись координатора в таблице segments.
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта.
 * @param coordinator_username Имя пользователя координатора.
 * @param rised_amount Сумма привлеченных средств.
 */
void upsert_coordinator_segment(eosio::name coopname, const checksum256 &project_hash, 
                                       eosio::name coordinator_username, const eosio::asset &rised_amount) {
    Segments::segments_index segments(_capital, coopname.value);
    auto exist_segment = Segments::get_segment(coopname, project_hash, coordinator_username);
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
        
    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segments.available_primary_key();
            g.project_hash  = project_hash;
            g.username      = coordinator_username;
            g.coordinator_investments   = rised_amount;
            g.is_coordinator = true;
            g.last_coordinator_reward_per_share = project.crps.coordinator_cumulative_reward_per_share;
        });
        
        Capital::Projects::increment_total_coordinators(coopname, project_hash);
    } else {
        auto segment = segments.find(exist_segment->id);
        segments.modify(segment, _capital, [&](auto &g) {
            if (!g.is_coordinator) {
                g.is_coordinator = true;
                Capital::Projects::increment_total_coordinators(coopname, project_hash);
            }
            g.coordinator_investments += rised_amount;
        });
    }
    
}

  /**
   * @brief Обновляет награды координатора в сегменте
   */
  void refresh_coordinator_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    Segments::segments_index segments(_capital, coopname.value);
    auto segment_opt = Segments::get_segment(coopname, project_hash, username);
    
    if (!segment_opt.has_value()) {
      return; // Сегмент не найден
    }
    
    auto segment_it = segments.find(segment_opt->id);
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    segments.modify(segment_it, _capital, [&](auto &s) {
      if (s.is_coordinator) {
        int64_t pending_coordinator_reward = 1 * 
          (project.crps.coordinator_cumulative_reward_per_share - s.last_coordinator_reward_per_share);
        
        if (pending_coordinator_reward > 0) {
          eosio::asset coordinator_reward_asset = eosio::asset(pending_coordinator_reward, _root_govern_symbol);
          s.coordinator_base += coordinator_reward_asset;
          s.last_coordinator_reward_per_share = project.crps.coordinator_cumulative_reward_per_share;
        }
      }
    });
    
  }

}// namespace Capital::Core