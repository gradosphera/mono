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
            g.id            = get_global_id_in_scope(_capital, coopname, "segments"_n);
            g.coopname      = coopname;
            g.project_hash  = project_hash;
            g.username      = username;
            g.is_author = true;
            // Инициализируем CRPS поля
            g.last_author_base_reward_per_share = project.crps.author_base_cumulative_reward_per_share;
            g.last_author_bonus_reward_per_share = project.crps.author_bonus_cumulative_reward_per_share;
        });
        
        Capital::Projects::increment_total_authors(coopname, project_hash);
        // Обновляем статус голосования участника
        Capital::Core::Voting::update_voting_status(coopname, project_hash, username);
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
        }
        
        // Всегда обновляем статус голосования после изменения ролей
        Capital::Core::Voting::update_voting_status(coopname, project_hash, username);
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
        double base_delta = project.crps.author_base_cumulative_reward_per_share - s.last_author_base_reward_per_share;
        if (base_delta > 0.0) {
          int64_t pending_base_reward = static_cast<int64_t>(base_delta);
          if (pending_base_reward > 0) {
            s.author_base += eosio::asset(pending_base_reward, _root_govern_symbol);
            s.last_author_base_reward_per_share = project.crps.author_base_cumulative_reward_per_share;
          }
        }
        
        // Обновляем бонусные авторские награды
        double bonus_delta = project.crps.author_bonus_cumulative_reward_per_share - s.last_author_bonus_reward_per_share;
        if (bonus_delta > 0.0) {
          int64_t pending_bonus_reward = static_cast<int64_t>(bonus_delta);
          if (pending_bonus_reward > 0) {
            s.author_bonus += eosio::asset(pending_bonus_reward, _root_govern_symbol);
            s.last_author_bonus_reward_per_share = project.crps.author_bonus_cumulative_reward_per_share;
          }
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
          double base_delta = static_cast<double>(base_reward.amount) / static_cast<double>(p.counts.total_authors);
          p.crps.author_base_cumulative_reward_per_share += base_delta;
        }
        
        // Обновляем бонусные авторские награды
        if (bonus_reward.amount > 0) {
          double bonus_delta = static_cast<double>(bonus_reward.amount) / static_cast<double>(p.counts.total_authors);
          p.crps.author_bonus_cumulative_reward_per_share += bonus_delta;
        }
      }
    });
  }



}// namespace Capital::Core