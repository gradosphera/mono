#include "crps.hpp"

using namespace eosio;
using std::string;

// Подключение всех CRPS реализаций
#include "author_crps.cpp"
#include "contributor_crps.cpp"
#include "coordinator_share.cpp"  // Пропорциональное распределение для координаторов
#include "creator_crps.cpp"
#include "program_crps.cpp"
#include "propertor_segment.cpp"  // Обработка имущественных взносов

namespace Capital::Core {

  /**
   * @brief Обновляет сегмент участника - диспетчер для обновления всех ролей
   */
  void refresh_segment(eosio::name coopname, uint64_t segment_id, const Capital::project &project) {
    
    // Обновляем награды для каждой роли отдельно
    refresh_author_segment(coopname, segment_id, project);
    refresh_coordinator_segment(coopname, segment_id, project);
    refresh_contributor_segment(coopname, segment_id, project);
    
    // Пересчитываем доступную сумму к компенсации
    refresh_provisional_amount(coopname, segment_id, project);
    
    // Обновляем фактически используемую сумму инвестора если он является инвестором
    update_investor_used_amount(coopname, segment_id, project);
      
    // Обновляем общую стоимость сегмента в конце
    Capital::Segments::update_segment_total_cost(coopname, segment_id, project);

  }
  
    
  /**
  * @brief Проверяет является ли сегмент обновленным (CRPS актуален и инвестиции синхронизированы)
  * @param coopname Имя кооператива
  * @param project Проект
  * @param segment Сегмент
  * @return true если сегмент обновлен
  */
  inline bool is_segment_updated(eosio::name coopname, const Capital::project &project, const Capital::Segments::segment &segment) {
    // Проверяем актуальность CRPS для каждой роли
    bool author_updated = (!segment.is_author) || 
                        (segment.last_author_base_reward_per_share == project.crps.author_base_cumulative_reward_per_share &&
                          segment.last_author_bonus_reward_per_share == project.crps.author_bonus_cumulative_reward_per_share);
    
    // Координаторы используют пропорциональное распределение на основе coordinators_investment_pool
    bool coordinator_updated = (!segment.is_coordinator) || 
                              (segment.last_known_coordinators_investment_pool == project.fact.coordinators_investment_pool);
    
    bool contributor_updated = (!segment.is_contributor) || 
                              (segment.last_contributor_reward_per_share == project.crps.contributor_cumulative_reward_per_share);
    
    // Проверяем актуальность инвестиционного пула для расчета provisional_amount (нужно всем ролям)
    bool invest_pool_updated = (segment.last_known_invest_pool == project.fact.invest_pool);
    
    // Проверяем актуальность базового пула создателей для корректного расчета использования инвестиций (нужно только инвесторам)
    bool creators_base_pool_updated = (!segment.is_investor) || 
                                    (segment.last_known_creators_base_pool == project.fact.creators_base_pool);
    
    return author_updated && coordinator_updated && contributor_updated && invest_pool_updated && creators_base_pool_updated;
  }

  /**
  * @brief Проверяет является ли сегмент обновленным или падает с ошибкой
  */
  inline void check_segment_is_updated(eosio::name coopname, const Capital::project &project, const Capital::Segments::segment &segment, 
                                  const char* msg = "Сегмент не обновлен. Необходимо выполнить rfrshsegment") {
    eosio::check(is_segment_updated(coopname, project, segment), msg);
  }


  /**
   * @brief Пересчитывает доступную сумму к компенсации на основе инвестиций с учетом return_base_percent
   */
  void refresh_provisional_amount(eosio::name coopname, uint64_t segment_id, const Capital::project &project) {
    Segments::segments_index segments(_capital, coopname.value);
    auto segment = segments.find(segment_id);
    if (segment == segments.end()) {
      return; // Сегмент не найден
    }
    
    // Базовые поля текущего пользователя (себестоимость труда)
    int64_t user_base_amount = segment->creator_base.amount + 
                              segment->author_base.amount + 
                              segment->coordinator_base.amount; //имущественный взнос здесь НЕ учитывается
    
    // Если нет себестоимости труда у пользователя, provisional_amount = 0
    if (user_base_amount == 0) {
      segments.modify(segment, coopname, [&](auto &s) {
        s.provisional_amount = eosio::asset(0, _root_govern_symbol);
        s.last_known_invest_pool = project.fact.invest_pool; // Все равно синхронизируем инвестиции
        s.last_known_creators_base_pool = project.fact.creators_base_pool; // Синхронизируем с актуальной суммой базового пула создателей
      });
      return;
    }
    
    // Рассчитываем provisional_amount с учетом return_base_percent (в процентах)
    double return_coefficient_percent = project.fact.return_base_percent;
    
    // provisional_amount = себестоимость_труда * (return_base_percent / 100)
    int64_t provisional_amount = static_cast<int64_t>(
      static_cast<double>(user_base_amount) * (return_coefficient_percent / 100.0)
    );
    
    eosio::check(provisional_amount <= project.fact.invest_pool.amount, "Cумма доступной ссуды не может превышать сумму инвестиций проекта");
    
    // Обновляем provisional_amount и синхронизируем известные пулы в сегменте
    segments.modify(segment, coopname, [&](auto &s) {
      s.provisional_amount = eosio::asset(provisional_amount, _root_govern_symbol);
      s.last_known_invest_pool = project.fact.invest_pool; // Синхронизируем с актуальной суммой инвестиций
      s.last_known_creators_base_pool = project.fact.creators_base_pool; // Синхронизируем с актуальной суммой базового пула создателей
    });
  }



  /**
   * @brief Создает или обновляет запись инвестора в таблице segments
   */
  void upsert_investor_segment(eosio::name coopname, uint64_t segment_id, const Capital::project &project, 
                                        eosio::name username, const eosio::asset &investor_amount) {
    Segments::segments_index segments(_capital, coopname.value);
    auto segment = segments.find(segment_id);
        
    if (segment == segments.end()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segment_id;
            g.coopname      = coopname;
            g.project_hash  = project.project_hash;
            g.username      = username;
            g.investor_amount = investor_amount;
            g.is_investor = true;
        });

        // Увеличиваем счетчики для нового участника
        Capital::Projects::increment_total_unique_participants(coopname, project.id);
        Capital::Projects::increment_total_investors(coopname, project.id);
        
    } else {
        segments.modify(segment, _capital, [&](auto &g) {
            if (!g.is_investor) {
                g.is_investor = true;
                Capital::Projects::increment_total_investors(coopname, project.id);
            }
            g.investor_amount += investor_amount;
        });
    }
    
    // Обновляем фактически используемую сумму инвестора с учетом коэффициента
    update_investor_used_amount(coopname, segment_id, project);
    
    // Обновляем общую стоимость сегмента
    Capital::Segments::update_segment_total_cost(coopname, segment_id, project);
  }

  /**
   * @brief Обновляет доли участника в кошельке проекта для получения членских взносов
   */
  void refresh_project_wallet_membership_rewards(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    auto wallet_opt = Capital::Wallets::get_project_wallet(coopname, project_hash, username);
    
    if (!wallet_opt.has_value()) {
      return; // Кошелек проекта не найден
    }
    
    Capital::project_wallets_index project_wallets(_capital, coopname.value);
    auto wallet_it = project_wallets.find(wallet_opt->id);
    
    // Если у участника нет долей в кошельке проекта, то нет и права на членские взносы
    if (wallet_opt->shares.amount == 0 || project.membership.total_shares.amount == 0) {
      project_wallets.modify(wallet_it, _capital, [&](auto &w) {
        w.last_membership_reward_per_share = project.membership.cumulative_reward_per_share;
      });
      return;
    }
    
    project_wallets.modify(wallet_it, _capital, [&](auto &w) {
      // Рассчитываем накопленные награды от членских взносов
      double membership_delta = project.membership.cumulative_reward_per_share - w.last_membership_reward_per_share;
      
      if (membership_delta > 0.0) {
        double pending_reward_double = static_cast<double>(w.shares.amount) * membership_delta;
        int64_t pending_membership_reward = static_cast<int64_t>(pending_reward_double);
        
        if (pending_membership_reward > 0) {
          w.membership_available += eosio::asset(pending_membership_reward, _root_govern_symbol);
        }
      }
      
      w.last_membership_reward_per_share = project.membership.cumulative_reward_per_share;
    });
  }

  /**
   * @brief Обновляет фактически используемую сумму инвестора в сегменте с учетом коэффициента возврата
   * @param coopname Имя кооператива
   * @param segment_id ID сегмента
   * @param project Проект
   */
  void update_investor_used_amount(eosio::name coopname, uint64_t segment_id, const Capital::project &project) {
    Segments::segments_index segments(_capital, coopname.value);
    auto segment = segments.find(segment_id);
    
    if (segment == segments.end() || !segment->is_investor) {
      return; // Не инвестор
    }
    
    segments.modify(segment, _capital, [&](auto &s) {
      // Рассчитываем фактически используемую сумму инвестора (используем коэффициент возврата инвестиций)
      s.investor_base = Capital::Core::Generation::calculate_investor_used_amount(
        s.investor_amount, 
        project.fact.use_invest_percent
      );
      // Синхронизируем известные пулы для корректного определения необходимости обновления сегмента
      s.last_known_invest_pool = project.fact.invest_pool;
      s.last_known_creators_base_pool = project.fact.creators_base_pool;
    });
  }

}