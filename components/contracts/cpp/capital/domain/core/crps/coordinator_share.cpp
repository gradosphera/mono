#include "crps.hpp"

namespace Capital::Core {

  /**
   * @brief Рассчитывает пропорциональную долю координатора в общем пуле премий
   * @param coordinator_investments Сумма инвестиций, привлеченная координатором
   * @param total_coordinator_investments Общая сумма инвестиций, привлеченная всеми координаторами
   * @param plan_total_investments Плановая общая сумма инвестиций проекта
   * @param coordinator_base_pool Общий пул премий координаторов
   * @param all_coordinators_scores Сумма всех промежуточных баллов R всех координаторов
   * @return Доля координатора в пуле премий
   */
  inline eosio::asset calculate_coordinator_proportional_share(
    const eosio::asset &coordinator_investments,
    const eosio::asset &total_coordinator_investments, 
    const eosio::asset &plan_total_investments,
    const eosio::asset &coordinator_base_pool,
    double all_coordinators_scores
  ) {
    if (coordinator_investments.amount == 0 || 
        total_coordinator_investments.amount == 0 || 
        plan_total_investments.amount == 0 || 
        all_coordinators_scores <= 0.0) {
      return eosio::asset(0, _root_govern_symbol);
    }

    // Rn = (Yn / invest_plan) * (Yn / YN_fact_invest)
    double coordinator_score = 
      (static_cast<double>(coordinator_investments.amount) / static_cast<double>(plan_total_investments.amount)) *
      (static_cast<double>(coordinator_investments.amount) / static_cast<double>(total_coordinator_investments.amount));

    // Zn = Rn / RN * coordinator_base_fact
    double share_ratio = coordinator_score / all_coordinators_scores;
    int64_t coordinator_share = static_cast<int64_t>(
      static_cast<double>(coordinator_base_pool.amount) * share_ratio
    );

    return eosio::asset(coordinator_share, _root_govern_symbol);
  }

  /**
   * @brief Рассчитывает промежуточный балл R для координатора
   */
  inline double calculate_coordinator_score(
    const eosio::asset &coordinator_investments,
    const eosio::asset &total_coordinator_investments,
    const eosio::asset &plan_total_investments
  ) {
    if (coordinator_investments.amount == 0 || 
        total_coordinator_investments.amount == 0 || 
        plan_total_investments.amount == 0) {
      return 0.0;
    }

    return (static_cast<double>(coordinator_investments.amount) / static_cast<double>(plan_total_investments.amount)) *
           (static_cast<double>(coordinator_investments.amount) / static_cast<double>(total_coordinator_investments.amount));
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
        
    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segments.available_primary_key();
            g.coopname      = coopname;
            g.project_hash  = project_hash;
            g.username      = coordinator_username;
            g.coordinator_investments   = rised_amount;
            g.is_coordinator = true;
            // Не устанавливаем CRPS поля, т.к. используем пропорциональное распределение
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
   * @brief Обновляет награды координатора в сегменте на основе пропорционального распределения
   */
  void refresh_coordinator_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Если нет координаторов или премий к распределению, ничего не делаем
    if (project.counts.total_coordinators == 0 || project.fact.coordinators_base_pool.amount == 0) {
      return;
    }
    
    // Получаем всех координаторов проекта
    auto coordinators = Capital::Segments::get_project_coordinators(coopname, project_hash);
    
    if (coordinators.empty()) {
      return;
    }
    
    // Рассчитываем общую сумму промежуточных баллов R всех координаторов
    double total_coordinators_score = 0.0;
    for (const auto& coord : coordinators) {
      total_coordinators_score += calculate_coordinator_score(
        coord.coordinator_investments,
        project.fact.coordinators_investment_pool,
        project.plan.total_received_investments
      );
    }
    
    if (total_coordinators_score <= 0.0) {
      return; // Нет баллов для распределения
    }
    
    // Обновляем координаторские доли для всех координаторов проекта
    Segments::segments_index segments(_capital, coopname.value);
    
    for (const auto& coord : coordinators) {
      auto segment_it = segments.find(coord.id);
      
      eosio::asset new_coordinator_base = calculate_coordinator_proportional_share(
        coord.coordinator_investments,
        project.fact.coordinators_investment_pool,
        project.plan.total_received_investments,
        project.fact.coordinators_base_pool,
        total_coordinators_score
      );
      
      segments.modify(segment_it, _capital, [&](auto &s) {
        s.coordinator_base = new_coordinator_base;
      });
    }
  }

}// namespace Capital::Core