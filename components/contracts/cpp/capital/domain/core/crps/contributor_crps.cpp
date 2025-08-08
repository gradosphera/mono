#include "crps.hpp"

namespace Capital::Core {

  
  /**
   * @brief Обновляет CRPS поля в проекте для вкладчиков при добавлении наград
   */
   void update_contributor_crps(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &reward_amount) {
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      if (p.crps.total_capital_contributors_shares.amount > 0) {
        // Рассчитываем дельту reward per share (награда на долю в базовых единицах)
        int64_t delta = reward_amount.amount / p.crps.total_capital_contributors_shares.amount;
        p.crps.contributor_cumulative_reward_per_share += delta;
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
    eosio::asset user_shares = Capital::Core::get_capital_user_share_balance(coopname, username);
    
    Segments::segments_index segments(_capital, coopname.value);
    auto exist_segment = Segments::get_segment(coopname, project_hash, username);
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
        
    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segments.available_primary_key();
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
      // Обновляем награды вкладчика
      if (s.capital_contributor_shares.amount > 0) {
        int64_t pending_contributor_reward = s.capital_contributor_shares.amount * 
          (project.crps.contributor_cumulative_reward_per_share - s.last_contributor_reward_per_share);
        
        if (pending_contributor_reward > 0) {
          s.contributor_bonus += eosio::asset(pending_contributor_reward, _root_govern_symbol);
          s.last_contributor_reward_per_share = project.crps.contributor_cumulative_reward_per_share;
        }
      }
      
      // Обновление capital_contributor_shares на основе текущего баланса
      eosio::asset capital_balance = Capital::Core::get_capital_user_share_balance(coopname, username);
      
      if (s.capital_contributor_shares != capital_balance) {
        // Корректируем общие доли в проекте
        Capital::project_index projects(_capital, coopname.value);
        auto project_it = projects.find(project.id);
        projects.modify(project_it, _capital, [&](auto &p) {
          p.crps.total_capital_contributors_shares = p.crps.total_capital_contributors_shares - s.capital_contributor_shares + capital_balance;
        });
        
        // Если становится новым вкладчиком, инициализируем CRPS и устанавливаем флаг
        if (!s.is_contributor && capital_balance.amount > 0) {
          s.is_contributor = true;
          s.last_contributor_reward_per_share = project.crps.contributor_cumulative_reward_per_share;
          // Увеличиваем счетчик зарегистрированных вкладчиков
          Capital::Projects::increment_total_contributors(coopname, project_hash);
        }
        
        s.capital_contributor_shares = capital_balance;
      }
    });
  }

}// namespace Capital::Core