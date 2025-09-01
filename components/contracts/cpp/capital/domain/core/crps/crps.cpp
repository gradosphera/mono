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
  void refresh_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    auto segment_opt = Segments::get_segment_or_fail(coopname, project_hash, username, "Сегмент пайщика не найден");
    
    bool is_segment_updated = Capital::Segments::is_segment_updated(coopname, project_hash, username);
    
    if (is_segment_updated) {
      return; // Сегмент обновлен
    }
    print("before refresh_segment");
    // Обновляем награды для каждой роли отдельно
    refresh_author_segment(coopname, project_hash, username);
    refresh_coordinator_segment(coopname, project_hash, username);
    refresh_contributor_segment(coopname, project_hash, username);
    
    // Пересчитываем доступную сумму к компенсации
    refresh_provisional_amount(coopname, project_hash, username);
    
    // Обновляем фактически используемую сумму инвестора если он является инвестором
    update_investor_used_amount(coopname, project_hash, username);
    
    // Обновляем общую стоимость сегмента в конце
    Capital::Segments::update_segment_total_cost(coopname, project_hash, username);
  }

  /**
   * @brief Пересчитывает доступную сумму к компенсации на основе инвестиций с учетом return_base_percent
   */
  void refresh_provisional_amount(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    auto segment_opt = Segments::get_segment(coopname, project_hash, username);
    if (!segment_opt.has_value()) {
      return; // Сегмент не найден
    }
    
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Базовые поля текущего пользователя (себестоимость труда)
    int64_t user_base_amount = segment_opt->creator_base.amount + 
                              segment_opt->author_base.amount + 
                              segment_opt->coordinator_base.amount; //имущественный взнос здесь НЕ учитывается
    
    // Если нет себестоимости труда у пользователя, provisional_amount = 0
    if (user_base_amount == 0) {
      Segments::segments_index segments(_capital, coopname.value);
      auto segment_it = segments.find(segment_opt->id);
      segments.modify(segment_it, _capital, [&](auto &s) {
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
    Segments::segments_index segments(_capital, coopname.value);
    auto segment_it = segments.find(segment_opt->id);
    segments.modify(segment_it, _capital, [&](auto &s) {
      s.provisional_amount = eosio::asset(provisional_amount, _root_govern_symbol);
      s.last_known_invest_pool = project.fact.invest_pool; // Синхронизируем с актуальной суммой инвестиций
      s.last_known_creators_base_pool = project.fact.creators_base_pool; // Синхронизируем с актуальной суммой базового пула создателей
    });
  }



  /**
   * @brief Создает или обновляет запись инвестора в таблице segments
   */
  void upsert_investor_segment(eosio::name coopname, const checksum256 &project_hash, 
                                        eosio::name username, const eosio::asset &investor_amount) {
    Segments::segments_index segments(_capital, coopname.value);
    auto exist_segment = Segments::get_segment(coopname, project_hash, username);
        
    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segments.available_primary_key();
            g.coopname      = coopname;
            g.project_hash  = project_hash;
            g.username      = username;
            g.investor_amount = investor_amount;
            g.is_investor = true;
        });
        
        Capital::Projects::increment_total_investors(coopname, project_hash);
        
    } else {
        auto segment = segments.find(exist_segment->id);
        segments.modify(segment, _capital, [&](auto &g) {
            if (!g.is_investor) {
                g.is_investor = true;
                Capital::Projects::increment_total_investors(coopname, project_hash);
            }
            g.investor_amount += investor_amount;
        });
    }
    
    // Обновляем общую стоимость сегмента
    Capital::Segments::update_segment_total_cost(coopname, project_hash, username);
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
   * @param project_hash Хэш проекта
   * @param username Имя инвестора
   */
  void update_investor_used_amount(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    Segments::segments_index segments(_capital, coopname.value);
    auto segment_opt = Segments::get_segment(coopname, project_hash, username);
    
    if (!segment_opt.has_value() || !segment_opt->is_investor) {
      return; // Не инвестор
    }
    
    auto segment = segments.find(segment_opt->id);
    
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