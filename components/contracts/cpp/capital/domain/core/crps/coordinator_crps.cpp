#include "crps.hpp"

namespace Capital::Core {

  /**
   * @brief Обновляет CRPS поля в проекте для координаторов при добавлении наград
   */
  inline void update_coordinator_crps(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &reward_amount) {
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      if (p.fact.total_coordinator_shares > 0) {
        // Рассчитываем дельту reward per share
        int64_t delta = (reward_amount.amount * REWARD_SCALE) / p.fact.total_coordinator_shares;
        p.fact.coordinator_cumulative_reward_per_share += delta;
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
    Circle::segments_index segments(_capital, coopname.value);
    auto exist_segment = Circle::get_segment(coopname, project_hash, coordinator_username);
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
        
    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segments.available_primary_key();
            g.project_hash  = project_hash;
            g.username      = coordinator_username;
            g.coordinator_investments   = rised_amount;
            g.coordinator_shares = 1;
            g.last_coordinator_reward_per_share = project.fact.coordinator_cumulative_reward_per_share;
        });
        
        Capital::Projects::increment_total_coordinator_shares(coopname, project_hash);
    } else {
        auto segment = segments.find(exist_segment->id);
        segments.modify(segment, _capital, [&](auto &g) {
            if (g.coordinator_shares == 0) {
                g.coordinator_shares = 1;
                Capital::Projects::increment_total_coordinator_shares(coopname, project_hash);
            }
            g.coordinator_investments += rised_amount;
            
            //TODO: добавить расчетную сумму для ссуды
            // g.provisional_amount += ???;
        });
    }
}

  /**
   * @brief Обновляет награды координатора в сегменте
   */
  void refresh_coordinator_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    Circle::segments_index segments(_capital, coopname.value);
    auto segment_opt = Circle::get_segment(coopname, project_hash, username);
    
    if (!segment_opt.has_value()) {
      return; // Сегмент не найден
    }
    
    auto segment_it = segments.find(segment_opt->id);
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    segments.modify(segment_it, _capital, [&](auto &s) {
      if (s.coordinator_shares > 0) {
        int64_t pending_coordinator_reward = s.coordinator_shares * 
          (project.fact.coordinator_cumulative_reward_per_share - s.last_coordinator_reward_per_share) / REWARD_SCALE;
        
        if (pending_coordinator_reward > 0) {
          s.coordinator_base += eosio::asset(pending_coordinator_reward, _root_govern_symbol);
          s.last_coordinator_reward_per_share = project.fact.coordinator_cumulative_reward_per_share;
        }
      }
    });
  }

}// namespace Capital::Core