#include "crps.hpp"

using namespace eosio;
using std::string;

// Подключение всех CRPS реализаций
#include "author_crps.cpp"
#include "contributor_crps.cpp"
#include "coordinator_crps.cpp"
#include "creator_crps.cpp"

namespace Capital::Core {

  /**
   * @brief Обновляет сегмент участника - диспетчер для обновления всех ролей
   */
  void refresh_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    auto segment_opt = Circle::get_segment(coopname, project_hash, username);
    if (!segment_opt.has_value()) {
      return; // Сегмент не найден
    }
    
    // Обновляем награды для каждой роли отдельно
    refresh_author_segment(coopname, project_hash, username);
    refresh_coordinator_segment(coopname, project_hash, username);
    refresh_contributor_segment(coopname, project_hash, username);
    
    // Пересчитываем доступную сумму к компенсации
    refresh_provisional_amount(coopname, project_hash, username);
  }

  /**
   * @brief Пересчитывает доступную сумму к компенсации на основе инвестиций
   */
  void refresh_provisional_amount(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    auto segment_opt = Circle::get_segment(coopname, project_hash, username);
    if (!segment_opt.has_value()) {
      return; // Сегмент не найден
    }
    
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Если нет инвестиций, provisional_amount = 0
    if (project.fact.invest_pool.amount == 0) {
      Circle::segments_index segments(_capital, coopname.value);
      auto segment_it = segments.find(segment_opt->id);
      segments.modify(segment_it, _capital, [&](auto &s) {
        s.provisional_amount = eosio::asset(0, _root_govern_symbol);
      });
      return;
    }
    
    // Общая сумма базовых полей всех ролей = сумма пулов проекта
    int64_t total_base_amount = project.fact.creators_base_pool.amount + 
                               project.fact.authors_base_pool.amount + 
                               project.fact.coordinators_base_pool.amount;
    
    // Базовые поля текущего пользователя
    int64_t user_base_amount = segment_opt->creator_base.amount + 
                              segment_opt->author_base.amount + 
                              segment_opt->coordinator_base.amount;
    
    // Рассчитываем пропорциональную долю от инвестиций
    int64_t provisional_amount = 0;
    if (total_base_amount > 0 && user_base_amount > 0) {
      provisional_amount = static_cast<int64_t>((static_cast<double>(user_base_amount) * static_cast<double>(project.fact.invest_pool.amount)) / static_cast<double>(total_base_amount));
    }
    
    // Обновляем provisional_amount в сегменте
    Circle::segments_index segments(_capital, coopname.value);
    auto segment_it = segments.find(segment_opt->id);
    segments.modify(segment_it, _capital, [&](auto &s) {
      s.provisional_amount = eosio::asset(provisional_amount, _root_govern_symbol);
    });
  }



  /**
   * @brief Создает или обновляет запись инвестора в таблице segments
   */
  void upsert_investor_segment(eosio::name coopname, const checksum256 &project_hash, 
                                        eosio::name username, const eosio::asset &investor_amount) {
    Circle::segments_index segments(_capital, coopname.value);
    auto exist_segment = Circle::get_segment(coopname, project_hash, username);
        
    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segments.available_primary_key();
            g.project_hash  = project_hash;
            g.username      = username;
            g.investor_base = investor_amount;
            g.investor_shares = 1;
        });
        
        Capital::Projects::increment_total_investor_shares(coopname, project_hash);
        
    } else {
        auto segment = segments.find(exist_segment->id);
        segments.modify(segment, _capital, [&](auto &g) {
            if (g.investor_shares == 0) {
                g.investor_shares = 1;
                Capital::Projects::increment_total_investor_shares(coopname, project_hash);
            }
            g.investor_base += investor_amount;
        });
    }
  }

}