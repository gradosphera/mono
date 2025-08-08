#include "crps.hpp"
  
namespace Capital::Core {
    
  /**
  * @brief Создает или обновляет запись генератора для автора в таблице segments.
  * @param coopname Имя кооператива (scope таблицы).
  * @param project_hash Хэш проекта.
  * @param username Имя пользователя автора.
  * @param shares Количество авторских долей.
  */
  void upsert_author_segment(eosio::name coopname, const checksum256 &project_hash, 
                                      eosio::name username) {
    Segments::segments_index segments(_capital, coopname.value);
    auto exist_segment = Capital::Segments::get_segment(coopname, project_hash, username);
        
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segments.available_primary_key();
            g.project_hash  = project_hash;
            g.username      = username;
            g.is_author = true;
            // Инициализируем CRPS поля
            g.last_author_base_reward_per_share = project.crps.author_base_cumulative_reward_per_share;
            g.last_author_bonus_reward_per_share = project.crps.author_bonus_cumulative_reward_per_share;
        });
        
        Capital::Projects::increment_total_authors(coopname, project_hash);
        // Увеличиваем счетчик участников голосования, т.к. новый автор имеет право голоса
        Capital::Projects::increment_total_voters(coopname, project_hash);
    } else {
        auto segment = segments.find(exist_segment->id);
        bool became_author = (!exist_segment->is_author);
        
        segments.modify(segment, _capital, [&](auto &g) {
            if (!g.is_author) {
                g.is_author = true;
                // Инициализируем CRPS поля для нового автора
                g.last_author_base_reward_per_share = project.crps.author_base_cumulative_reward_per_share;
                g.last_author_bonus_reward_per_share = project.crps.author_bonus_cumulative_reward_per_share;
            }
        });
        
        if (became_author) {
            Capital::Projects::increment_total_authors(coopname, project_hash);
            // Увеличиваем счетчик участников голосования, т.к. участник стал автором
            Capital::Projects::increment_total_voters(coopname, project_hash);
        }
    }
    
  }
  
  /**
   * @brief Обновляет награды автора в сегменте
   */
  void refresh_author_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    Segments::segments_index segments(_capital, coopname.value);
    auto segment_opt = Segments::get_segment(coopname, project_hash, username);
    
    if (!segment_opt.has_value()) {
      return; // Сегмент не найден
    }
    
    auto segment_it = segments.find(segment_opt->id);
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    segments.modify(segment_it, _capital, [&](auto &s) {
      if (s.is_author) {
        // Обновляем базовые авторские награды
        int64_t pending_base_reward = 1 * 
          (project.crps.author_base_cumulative_reward_per_share - s.last_author_base_reward_per_share);
        
        if (pending_base_reward > 0) {
          eosio::asset base_reward_asset = eosio::asset(pending_base_reward, _root_govern_symbol);
          s.author_base += base_reward_asset;
          s.last_author_base_reward_per_share = project.crps.author_base_cumulative_reward_per_share;
          
        }
        
        // Обновляем бонусные авторские награды
        int64_t pending_bonus_reward = 1 * 
          (project.crps.author_bonus_cumulative_reward_per_share - s.last_author_bonus_reward_per_share);
        
        if (pending_bonus_reward > 0) {
          s.author_bonus += eosio::asset(pending_bonus_reward, _root_govern_symbol);
          s.last_author_bonus_reward_per_share = project.crps.author_bonus_cumulative_reward_per_share;
        }        
      }
    });
    
  }
  
  /**
  * @brief Обновляет CRPS поля в проекте для авторов при добавлении наград
  */
  void increment_authors_crps_in_project(eosio::name coopname, const checksum256 &project_hash, 
                         const eosio::asset &base_reward, const eosio::asset &bonus_reward) {
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      if (p.counts.total_authors > 0) {
        // Обновляем базовые авторские награды
        if (base_reward.amount > 0) {
          int64_t base_delta = base_reward.amount / p.counts.total_authors;
          p.crps.author_base_cumulative_reward_per_share += base_delta;
        }
        
        // Обновляем бонусные авторские награды
        if (bonus_reward.amount > 0) {
          int64_t bonus_delta = bonus_reward.amount / p.counts.total_authors;
          p.crps.author_bonus_cumulative_reward_per_share += bonus_delta;
        }
      }
    });
  }



}// namespace Capital::Core