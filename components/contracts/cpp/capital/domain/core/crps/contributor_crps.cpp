#include "crps.hpp"

namespace Capital::Core {

  
  /**
   * @brief Обновляет CRPS поля в проекте для вкладчиков при добавлении наград
   */
   void increment_contributors_crps_in_project(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &reward_amount) {
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    print("DEBUG increment_contributors_crps: reward_amount=", reward_amount);
    print(" total_shares=", project->crps.total_capital_contributors_shares);
    print(" old_crps=", project->crps.contributor_cumulative_reward_per_share);
    
    projects.modify(project, _capital, [&](auto &p) {
      // Проверяем что есть зарегистрированные доли для распределения
      if (p.crps.total_capital_contributors_shares.amount > 0) {
        // Простой расчет награды на долю
        double reward_per_share = static_cast<double>(reward_amount.amount) / static_cast<double>(p.crps.total_capital_contributors_shares.amount);
        p.crps.contributor_cumulative_reward_per_share += reward_per_share;
        print(" reward_per_share=", reward_per_share);
        print(" new_crps=", p.crps.contributor_cumulative_reward_per_share);
      } else {
        print(" NO SHARES REGISTERED!");
      }
    });
  }

  
/**
 * @brief Создает или обновляет запись вкладчика в таблице segments.
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта.
 * @param username Имя пользователя вкладчика.
 */
void upsert_contributor_segment(eosio::name coopname, const checksum256 &project_hash, 
                                      eosio::name username) {
    // Проверяем наличие активного договора УХД и приложения к проекту
    auto contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, project_hash, username);
    
    // Проверяем положительный баланс в программе капитализации
    eosio::asset user_shares = Capital::Core::get_capital_program_user_share_balance(coopname, username);
    
    Segments::segments_index segments(_capital, coopname.value);
    auto exist_segment = Segments::get_segment(coopname, project_hash, username);
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
        
    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = get_global_id_in_scope(_capital, coopname, "segments"_n);
            g.coopname      = coopname;
            g.project_hash  = project_hash;
            g.username      = username;
            g.is_contributor = true; // Устанавливаем флаг вкладчика
            g.capital_contributor_shares = user_shares; // Доли равны балансу в программе капитализации
            // Инициализируем CRPS поля для вкладчика текущими значениями
            g.last_contributor_reward_per_share = project.crps.contributor_cumulative_reward_per_share;
        });
        
        // Увеличиваем счетчики вкладчиков
        Capital::Projects::increment_total_contributors(coopname, project_hash);
        Capital::Projects::increment_total_contributor_shares(coopname, project_hash, user_shares);
    } else {
        auto segment = segments.find(exist_segment->id);
        bool became_contributor = (!exist_segment->is_contributor);
        
        segments.modify(segment, _capital, [&](auto &g) {
            if (!g.is_contributor) {
                // Становится новым вкладчиком
                g.is_contributor = true;
                g.capital_contributor_shares = user_shares;
                g.last_contributor_reward_per_share = project.crps.contributor_cumulative_reward_per_share;
            } else {
                // Обновляем количество долей если баланс изменился
                if (user_shares != g.capital_contributor_shares) {
                    eosio::asset shares_delta = user_shares - g.capital_contributor_shares;
                    g.capital_contributor_shares = user_shares;
                    
                    // Обновляем общее количество долей в проекте
                    Capital::project_index projects(_capital, coopname.value);
                    auto project_it = projects.find(project.id);
                    projects.modify(project_it, _capital, [&](auto &p) {
                        p.crps.total_capital_contributors_shares += shares_delta;
                    });
                }
            }
        });
        
        if (became_contributor) {
            // Увеличиваем счетчик зарегистрированных вкладчиков
            Capital::Projects::increment_total_contributors(coopname, project_hash);
            // Увеличиваем счетчик долей для нового вкладчика
            Capital::Projects::increment_total_contributor_shares(coopname, project_hash, user_shares);
        }
    }
}

  /**
   * @brief Обновляет награды вкладчика в сегменте
   */
  void refresh_contributor_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    Segments::segments_index segments(_capital, coopname.value);
    auto segment_opt = Segments::get_segment(coopname, project_hash, username);
    
    if (!segment_opt.has_value()) {
      return; // Сегмент не найден
    }
    
    auto segment_it = segments.find(segment_opt->id);
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    segments.modify(segment_it, _capital, [&](auto &s) {
      // Обновляем награды вкладчика через CRPS алгоритм
      if (s.capital_contributor_shares.amount > 0) {
        // Разность наград на долю
        double reward_per_share_delta = project.crps.contributor_cumulative_reward_per_share - s.last_contributor_reward_per_share;
        
        if (reward_per_share_delta > 0.0) {
          // Простой расчет награды участника
          double pending_reward_double = static_cast<double>(s.capital_contributor_shares.amount) * reward_per_share_delta;
          int64_t pending_contributor_reward = static_cast<int64_t>(pending_reward_double);
          
          if (pending_contributor_reward > 0) {
            s.contributor_bonus += eosio::asset(pending_contributor_reward, _root_govern_symbol);
            s.last_contributor_reward_per_share = project.crps.contributor_cumulative_reward_per_share;
          }
        }
      } 
    });
  }

}// namespace Capital::Core