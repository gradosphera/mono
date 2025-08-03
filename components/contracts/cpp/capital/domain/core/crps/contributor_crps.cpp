#include "crps.hpp"

namespace Capital::Core {

  
  /**
   * @brief Обновляет CRPS поля в проекте для вкладчиков при добавлении наград
   */
   void update_contributor_crps(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &reward_amount) {
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      if (p.fact.total_contributor_shares > 0) {
        // Рассчитываем дельту reward per share
        int64_t delta = (reward_amount.amount * REWARD_SCALE) / p.fact.total_contributor_shares;
        p.fact.contributor_cumulative_reward_per_share += delta;
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
    int64_t user_balance = Capital::Core::get_capital_user_share_balance(coopname, username);
    eosio::check(user_balance > 0, "У пайщика отсутствует баланс в программе капитализации");
    
    uint64_t user_shares = static_cast<uint64_t>(user_balance);
    
    Circle::segments_index segments(_capital, coopname.value);
    auto exist_segment = Circle::get_segment(coopname, project_hash, username);
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
        
    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segments.available_primary_key();
            g.project_hash  = project_hash;
            g.username      = username;
            g.contributor_shares = user_shares; // Доли равны балансу в программе капитализации
            // Инициализируем CRPS поля для вкладчика текущими значениями
            g.last_contributor_reward_per_share = project.fact.contributor_cumulative_reward_per_share;
        });
        
        // Увеличиваем счетчик вкладчических долей в проекте
        Capital::Projects::increment_total_contributor_shares(coopname, project_hash, user_shares);
    } else {
        auto segment = segments.find(exist_segment->id);
        segments.modify(segment, _capital, [&](auto &g) {
            if (g.contributor_shares == 0) {
                // Это новый вкладчик
                g.contributor_shares = user_shares;
                g.last_contributor_reward_per_share = project.fact.contributor_cumulative_reward_per_share;
                // Увеличиваем счетчик
                Capital::Projects::increment_total_contributor_shares(coopname, project_hash, user_shares);
            } else {
                // Обновляем количество долей если баланс изменился
                if (user_shares != g.contributor_shares) {
                    int64_t shares_delta = static_cast<int64_t>(user_shares) - static_cast<int64_t>(g.contributor_shares);
                    g.contributor_shares = user_shares;
                    
                    // Обновляем общее количество долей в проекте
                    Capital::project_index projects(_capital, coopname.value);
                    auto project_it = projects.find(project.id);
                    projects.modify(project_it, _capital, [&](auto &p) {
                        p.fact.total_contributor_shares = static_cast<uint64_t>(
                            static_cast<int64_t>(p.fact.total_contributor_shares) + shares_delta
                        );
                    });
                }
            }
        });
    }
}

  /**
   * @brief Обновляет награды вкладчика в сегменте
   */
  void refresh_contributor_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    Circle::segments_index segments(_capital, coopname.value);
    auto segment_opt = Circle::get_segment(coopname, project_hash, username);
    
    if (!segment_opt.has_value()) {
      return; // Сегмент не найден
    }
    
    auto segment_it = segments.find(segment_opt->id);
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    segments.modify(segment_it, _capital, [&](auto &s) {
      // Обновляем награды вкладчика
      if (s.contributor_shares > 0) {
        int64_t pending_contributor_reward = s.contributor_shares * 
          (project.fact.contributor_cumulative_reward_per_share - s.last_contributor_reward_per_share) / REWARD_SCALE;
        
        if (pending_contributor_reward > 0) {
          s.contributor_bonus += eosio::asset(pending_contributor_reward, _root_govern_symbol);
          s.last_contributor_reward_per_share = project.fact.contributor_cumulative_reward_per_share;
        }
      }
      
      // Обновление contributor_shares на основе текущего баланса
      int64_t capital_balance = Capital::Core::get_capital_user_share_balance(coopname, username);
      
      if (s.contributor_shares != capital_balance) {
        // Корректируем общие доли в проекте
        Capital::project_index projects(_capital, coopname.value);
        auto project_it = projects.find(project.id);
        projects.modify(project_it, _capital, [&](auto &p) {
          p.fact.total_contributor_shares = p.fact.total_contributor_shares - s.contributor_shares + capital_balance;
        });
        
        // Если становится новым вкладчиком, инициализируем CRPS
        if (s.contributor_shares == 0 && capital_balance > 0) {
          s.last_contributor_reward_per_share = project.fact.contributor_cumulative_reward_per_share;
        }
        
        s.contributor_shares = capital_balance;
      }
    });
  }

}// namespace Capital::Core