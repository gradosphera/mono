#include "crps.hpp"

namespace Capital::Core {

  /**
   * @brief Рассчитывает координаторскую премию как процент от привлеченных им средств
   * @param coordinator_investments Сумма инвестиций, привлеченная координатором
   * @param referal_percent Процент вознаграждения координатора (например, 0.04 для 4%)
   * @return Премия координатора
   */
  inline eosio::asset calculate_coordinator_direct_reward(
    const eosio::asset &coordinator_investments,
    double referal_percent
  ) {
    if (coordinator_investments.amount == 0) {
      return eosio::asset(0, _root_govern_symbol);
    }

    // Прямой расчет: coordinator_base = Yn * referal_percent / (1 + referal_percent)
    int64_t coordinator_reward = static_cast<int64_t>(
      static_cast<double>(coordinator_investments.amount) * referal_percent / (1.0 + referal_percent)
    );

    return eosio::asset(coordinator_reward, _root_govern_symbol);
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
            g.coopname      = coopname;
            g.project_hash  = project_hash;
            g.username      = coordinator_username;
            g.coordinator_investments   = rised_amount;
            g.is_coordinator = true;
            // Инициализируем отслеживаемые поля для корректной работы пропорционального распределения
            g.last_known_coordinators_investment_pool = project.fact.coordinators_investment_pool;
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
            // Обновляем отслеживаемые поля при изменении coordinator_investments
            g.last_known_coordinators_investment_pool = project.fact.coordinators_investment_pool;
        });
    }
    
}

  /**
   * @brief Обновляет награды координатора в сегменте на основе прямого расчета (O(1) операция)
   */
  void refresh_coordinator_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    auto segment_opt = Segments::get_segment(coopname, project_hash, username);
    
    if (!segment_opt.has_value() || !segment_opt->is_coordinator) {
      return; // Сегмент не найден или пользователь не координатор
    }
    
    Segments::segments_index segments(_capital, coopname.value);
    auto segment_it = segments.find(segment_opt->id);
    
    // Если координатор ничего не привлек, обнуляем его базу
    if (segment_opt->coordinator_investments.amount == 0) {
      segments.modify(segment_it, _capital, [&](auto &s) {
        s.coordinator_base = asset(0, _root_govern_symbol);
        s.last_known_coordinators_investment_pool = project.fact.coordinators_investment_pool;
      });
      return;
    }
    
    // Получаем конфигурацию кооператива для процента координатора
    auto global_state = Capital::get_global_state(coopname);
    double referal_percent = global_state.config.coordinator_bonus_percent / 100.0; // Конвертируем из процентов в доли
    
    // Прямой расчет: coordinator_base = Yn * referal_percent / (1 + referal_percent)
    eosio::asset new_coordinator_base = calculate_coordinator_direct_reward(
      segment_opt->coordinator_investments,
      referal_percent
    );
    
    // Обновляем сегмент координатора
    segments.modify(segment_it, _capital, [&](auto &s) {
      s.coordinator_base = new_coordinator_base;
      s.last_known_coordinators_investment_pool = project.fact.coordinators_investment_pool;
    });
  }

}// namespace Capital::Core