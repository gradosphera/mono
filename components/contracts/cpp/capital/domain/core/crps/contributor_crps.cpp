#include "crps.hpp"

namespace Capital::Core {

  
  /**
   * @brief Обновляет CRPS поля в проекте для участников при добавлении наград
   */
   void increment_contributors_crps_in_project(eosio::name coopname, uint64_t project_id, const eosio::asset &reward_amount) {
    Capital::project_index projects(_capital, coopname.value);
    auto project_for_modify = projects.find(project_id);
    
    projects.modify(project_for_modify, _capital, [&](auto &p) {
      // Проверяем что есть зарегистрированные доли для распределения
      if (p.crps.total_capital_contributors_shares.amount > 0) {
        // Используем масштаб 10^14 для высокой точности:
        // - Накопленный CRPS остаётся в пределах 10^14-10^15, где double ещё точен
        // - При умножении на доли получаем до 10^28, что помещается в uint128_t (до ~3.4*10^38)
        // - После деления результат точен до копеек
        
        uint128_t reward_128 = static_cast<uint128_t>(reward_amount.amount);
        uint128_t shares_128 = static_cast<uint128_t>(p.crps.total_capital_contributors_shares.amount);
        
        // Масштаб 10^14
        uint128_t precision_factor = 100000000000000ULL; 
        
        uint128_t reward_per_share_scaled = (reward_128 * precision_factor) / shares_128;
        
        // Сохраняем как double - целые числа до 10^15 хранятся точно
        p.crps.contributor_cumulative_reward_per_share += static_cast<double>(reward_per_share_scaled);
      } else {
        print(" NO SHARES REGISTERED!");
      }
    });
  }

  
/**
 * @brief Создает или обновляет запись участника в таблице segments.
 * @param coopname Имя кооператива (scope таблицы).
 * @param segment_id ID сегмента.
 * @param project Проект.
 * @param username Имя пользователя участника.
 */
void upsert_contributor_segment(eosio::name coopname, uint64_t segment_id, const Capital::project &project, 
                                      eosio::name username, const eosio::asset &user_shares) {
    
    Segments::segments_index segments(_capital, coopname.value);
    auto segment = segments.find(segment_id);
        
    if (segment == segments.end()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segment_id;
            g.coopname      = coopname;
            g.project_hash  = project.project_hash;
            g.username      = username;
            g.is_contributor = true; // Устанавливаем флаг участника
            g.capital_contributor_shares = user_shares; // Доли равны балансу в программе капитализации
            // Инициализируем CRPS поля для участника текущими значениями
            g.last_contributor_reward_per_share = project.crps.contributor_cumulative_reward_per_share;
        });

        // Увеличиваем счетчики для нового участника
        Capital::Projects::increment_total_unique_participants(coopname, project.id);
        Capital::Projects::increment_total_contributors(coopname, project.id);
        Capital::Projects::increment_total_contributor_shares(coopname, project.id, user_shares);
    } else {
        bool became_contributor = (!segment->is_contributor);
    
        segments.modify(segment, _capital, [&](auto &g) {
            if (!g.is_contributor) {
                // Становится новым участником
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
            // Увеличиваем счетчик зарегистрированных участников
            Capital::Projects::increment_total_contributors(coopname, project.id);
            // Увеличиваем счетчик долей для нового участника
            Capital::Projects::increment_total_contributor_shares(coopname, project.id, user_shares);
        }
    }
}

  /**
   * @brief Обновляет награды участника в сегменте
   */
  void refresh_contributor_segment(eosio::name coopname, uint64_t segment_id, const Capital::project &project) {
    Segments::segments_index segments(_capital, coopname.value);
    auto segment = segments.find(segment_id);
    
    if (segment == segments.end()) {
      return; // Сегмент не найден
    }
    
    segments.modify(segment, coopname, [&](auto &s) {
      // Обновляем награды участника через CRPS алгоритм
      if (s.capital_contributor_shares.amount > 0) {
        // Разность наград на долю (уже масштабирована на 10^14)
        double reward_per_share_delta = project.crps.contributor_cumulative_reward_per_share - s.last_contributor_reward_per_share;
        
        if (reward_per_share_delta > 0.0) { 
          uint128_t shares_128 = static_cast<uint128_t>(s.capital_contributor_shares.amount);
          uint128_t delta_128 = static_cast<uint128_t>(reward_per_share_delta);
          uint128_t precision_factor = 100000000000000ULL; // 10^14
          
          // pending_reward = (shares * scaled_delta) / precision_factor
          uint128_t pending_reward_128 = (shares_128 * delta_128) / precision_factor;
          int64_t pending_contributor_reward = static_cast<int64_t>(pending_reward_128);
          
          if (pending_contributor_reward > 0) {
            s.contributor_bonus += eosio::asset(pending_contributor_reward, _root_govern_symbol);
          }
          // Всегда обновляем точку отсчета, если была дельта
          s.last_contributor_reward_per_share = project.crps.contributor_cumulative_reward_per_share;
        }
      } 
    });
  }

}// namespace Capital::Core
