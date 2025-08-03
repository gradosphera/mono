#pragma once

#include "pools.hpp"
#include "votes.hpp"

using namespace eosio;
using std::string;

namespace Capital {

/**
* @brief Таблица проектов
* 
*/
struct [[eosio::table, eosio::contract(CAPITAL)]] project {
  uint64_t id;
  
  name coopname;
  checksum256 project_hash;
  checksum256 parent_project_hash;
  eosio::name status; ///< Capital::Projects::Status

  // Мастер проекта
  name master;                                        ///< Мастер проекта
  
  std::string title;
  std::string description;
  std::string meta;

  uint64_t authors_count;
  uint64_t authors_shares;
  uint64_t commits_count;

  std::vector<uint64_t> expense_funds = {4}; 
  
  eosio::asset target = asset(0, _root_govern_symbol);
  eosio::asset invested = asset(0, _root_govern_symbol);
  eosio::asset available = asset(0, _root_govern_symbol);
  eosio::asset allocated = asset(0, _root_govern_symbol);
  
  pools plan;                                                   ///< Плановые показатели
  pools fact;                                                   ///< Фактические показатели
  
  // Голосование по методу Водянова
  voting_data voting;
  
  eosio::asset total = asset(0, _root_govern_symbol); // стоимость проекта с учетом генерации и капитализации
  
  eosio::asset expensed = asset(0, _root_govern_symbol);
  eosio::asset converted = asset(0, _root_govern_symbol);
  eosio::asset withdrawed = asset(0, _root_govern_symbol);
  
  double parent_distribution_ratio = 1;  
  int64_t membership_cumulative_reward_per_share = 0; 
  
  eosio::asset total_share_balance = asset(0, _root_govern_symbol); ///< Общее количество долей пайщиков в проекте
  eosio::asset membership_funded = asset(0, _root_govern_symbol);       ///< Общее количество поступивших членских взносов 
  eosio::asset membership_available = asset(0, _root_govern_symbol);    ///< Доступное количество членских взносов для участников проекта согласно долям
  eosio::asset membership_distributed = asset(0, _root_govern_symbol); ///< Распределенное количество членских взносов на участников проекта
  
  eosio::asset coordinator_funds = asset(0, _root_govern_symbol);       ///< Общая сумма координаторских взносов
      
  time_point_sec created_at = current_time_point();
  
  uint64_t primary_key() const { return id; }
  uint64_t by_created_at() const { return created_at.sec_since_epoch(); }
  checksum256 by_hash() const { return project_hash; }
};

typedef eosio::multi_index<"projects"_n, project,
  indexed_by<"bycreatedat"_n, const_mem_fun<project, uint64_t, &project::by_created_at>>,
  indexed_by<"byhash"_n, const_mem_fun<project, checksum256, &project::by_hash>>
> project_index;

}// namespace Capital


namespace Capital::Projects {

  /**
   * @brief Константы статусов проекта
   */
  namespace Status {
    const eosio::name CREATED = "created"_n;     ///< Проект создан
    const eosio::name OPENED = "opened"_n;       ///< Проект открыт для инвестиций
    const eosio::name ACTIVE = "active"_n;       ///< Проект активен для коммитов
    const eosio::name VOTING = "voting"_n;       ///< Проект на голосовании
    const eosio::name COMPLETED = "completed"_n; ///< Проект завершен
    const eosio::name CLOSED = "closed"_n;       ///< Проект закрыт
  }

  inline std::optional<project> get_project(eosio::name coopname, const checksum256 &project_hash) {
    project_index projects(_capital, coopname.value);
    auto project_hash_index = projects.get_index<"byhash"_n>();

    auto project_itr = project_hash_index.find(project_hash);
    if (project_itr == project_hash_index.end()) {
        return std::nullopt;
    }

    return *project_itr;
  }

  inline project get_project_or_fail(eosio::name coopname, const checksum256 &project_hash) {
    auto project = get_project(coopname, project_hash);
    eosio::check(project.has_value(), "Проект с указанным хэшем не найден");
    return *project;
  }


inline void validate_hierarchy_depth(eosio::name coopname, checksum256 project_hash) {
  uint8_t level = 0;
  project_index projects(_capital, coopname.value);
  
  auto current_project = get_project(coopname, project_hash);
  eosio::check(current_project.has_value(), "Проект не найден");

  while (current_project -> parent_project_hash != checksum256()) {
      eosio::check(level < 12, "Превышено максимальное количество уровней родительских проектов (12)");

      current_project = get_project(coopname, current_project->parent_project_hash);
      eosio::check(current_project.has_value(), "Родительский проект не найден");

      level++;
  };
};
  /**
  * @brief Добавляет коммит к проекту, обновляя фактические показатели и счетчик коммитов.
  * @param coopname Имя кооператива (scope таблицы).
  * @param project_hash Хэш проекта.
  * @param calculated_fact Рассчитанные фактические показатели для добавления.
  */
  inline void add_commit(eosio::name coopname, const checksum256 &project_hash, const pools &calculated_fact) {
      auto exist_project = get_project(coopname, project_hash);
      eosio::check(exist_project.has_value(), "Проект не найден");
      
      project_index projects(_capital, coopname.value);
      auto project = projects.find(exist_project->id);
      
      projects.modify(project, _capital, [&](auto &p) {
          // Увеличиваем счетчик коммитов
          p.commits_count++;
          
          // Обновляем время создателей
          p.fact.creators_hours += calculated_fact.creators_hours;
          
          // Инкрементальное вычисление среднего для стоимости часа
          if (calculated_fact.hour_cost.amount > 0) {
              auto cost_diff = calculated_fact.hour_cost - p.fact.hour_cost;
              p.fact.hour_cost += asset(cost_diff.amount / p.commits_count, p.fact.hour_cost.symbol);
          }
          
          // Обновляем остальные пулы
          p.fact.expenses_pool += calculated_fact.expenses_pool;
          p.fact.creators_base_pool += calculated_fact.creators_base_pool;
          p.fact.authors_base_pool += calculated_fact.authors_base_pool;
          p.fact.authors_bonus_pool += calculated_fact.authors_bonus_pool;
          p.fact.creators_bonus_pool += calculated_fact.creators_bonus_pool;
      });
  }

  /**
  * @brief Добавляет автора к проекту, обновляя счетчики авторов и долей.
  * @param coopname Имя кооператива (scope таблицы).
  * @param project_hash Хэш проекта.
  * @param shares Количество долей автора.
  */
  inline void add_author(eosio::name coopname, const checksum256 &project_hash, uint64_t shares) {
      auto exist_project = get_project_or_fail(coopname, project_hash);
      
      project_index projects(_capital, coopname.value);
      auto project = projects.find(exist_project.id);
      
      projects.modify(project, coopname, [&](auto &p) {
          p.authors_shares += shares;
          p.authors_count++;
      });
  }

  /**
  * @brief Обновляет статус проекта.
  * @param coopname Имя кооператива (scope таблицы).
  * @param project_hash Хэш проекта.
  * @param new_status Новый статус проекта.
  */
  inline void update_status(eosio::name coopname, const checksum256 &project_hash, eosio::name new_status) {
      auto exist_project = get_project_or_fail(coopname, project_hash);
      
      project_index projects(_capital, coopname.value);
      auto project = projects.find(exist_project.id);
      
      projects.modify(project, coopname, [&](auto &p) {
          p.status = new_status;
      });
  }

  /**
  * @brief Устанавливает плановые показатели проекта.
  * @param coopname Имя кооператива (scope таблицы).
  * @param project_hash Хэш проекта.
  * @param calculated_plan Рассчитанные плановые показатели.
  */
  inline void set_plan(eosio::name coopname, const checksum256 &project_hash, const pools &calculated_plan) {
      auto exist_project = get_project_or_fail(coopname, project_hash);
      
      project_index projects(_capital, coopname.value);
      auto project = projects.find(exist_project.id);
      
      projects.modify(project, coopname, [&](auto &p) {
        p.plan = calculated_plan;
      });
  }

  /**
   * @brief Добавляет инвестицию к проекту.
   * @param coopname Имя кооператива (scope таблицы).
   * @param project_hash Хэш проекта.
   * @param amount Сумма инвестиции для добавления.
   */
  inline void add_investments(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &amount) {
      auto exist_project = get_project_or_fail(coopname, project_hash);
      
      project_index projects(_capital, coopname.value);
      auto project = projects.find(exist_project.id);
      
      projects.modify(project, coopname, [&](auto &p) {
          p.fact.invest_pool += amount;
          
          // Пересчитываем коэффициент возврата себестоимости
          p.fact.return_cost_coefficient = Capital::Core::Generation::calculate_return_cost_coefficient(p.fact);
      });
  }

  /**
   * @brief Добавляет координаторские средства к проекту.
   * @param coopname Имя кооператива.
   * @param project_hash Хеш проекта.
   * @param amount Сумма координаторских взносов для добавления.
   */
  inline void add_coordinator_funds(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &amount) {
      auto exist_project = get_project_or_fail(coopname, project_hash);
      
      project_index projects(_capital, coopname.value);
      auto project = projects.find(exist_project.id);
      
      // Рассчитываем награду координаторов от инвестиций
      eosio::asset coordinator_base = Capital::Core::Generation::calculate_coordinator_bonus_from_investment(amount);
      
      projects.modify(project, coopname, [&](auto &p) {
          // Накапливаем инвестиции, привлеченные координаторами  
          p.fact.coordinators_investment_pool += amount;
          
          // Накапливаем общий пул премий координаторов
          p.fact.coordinators_base_pool += coordinator_base;
          
          // Пересчитываем коэффициент возврата себестоимости
          p.fact.return_cost_coefficient = Capital::Core::Generation::calculate_return_cost_coefficient(p.fact);
          
          // Пересчитываем премии вкладчиков, т.к. премии координаторов влияют на премии вкладчиков
          p.fact.contributors_bonus_pool = Capital::Core::Generation::calculate_contributors_bonus_pool(p.fact);
      });

      // Распределяем награды координаторов через CRPS систему
      Capital::Core::update_coordinator_crps(coopname, project_hash, coordinator_base);
  }
  
  
  /**
   * @brief Увеличивает количество инвесторских долей в проекте на 1
   */
   inline void increment_total_investor_shares(eosio::name coopname, const checksum256 &project_hash) {
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      p.fact.total_investor_shares += 1;
    });
  }

  /**
   * @brief Увеличивает количество вкладчических долей в проекте на указанное количество
   */
  inline void increment_total_contributor_shares(eosio::name coopname, const checksum256 &project_hash, uint64_t shares_amount) {
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      p.fact.total_contributor_shares += shares_amount;
    });
  }
  
  /**
   * @brief Увеличивает количество авторских долей в проекте на 1
   */
  inline void increment_total_author_shares(eosio::name coopname, const checksum256 &project_hash) {
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      p.fact.total_author_shares += 1;
    });
  }
  
    /**
   * @brief Увеличивает количество координаторских долей в проекте на 1
   */
  inline void increment_total_coordinator_shares(eosio::name coopname, const checksum256 &project_hash) {
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      p.fact.total_coordinator_shares += 1;
    });
  }
  
  /**
   * @brief Увеличивает количество создательских долей в проекте на 1
   */
  inline void increment_total_creator_shares(eosio::name coopname, const checksum256 &project_hash) {
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      p.fact.total_creator_shares += 1;
    });
  }

  /**
   * @brief Увеличивает счетчик полученных голосов в проекте
   */
  inline void increment_votes_received(eosio::name coopname, const checksum256 &project_hash) {
    auto exist_project = get_project_or_fail(coopname, project_hash);
    
    project_index projects(_capital, coopname.value);
    auto project = projects.find(exist_project.id);
    
    projects.modify(project, _capital, [&](auto &p) {
      p.voting.votes_received++;
    });
  }

  /**
   * @brief Увеличивает счетчик общего количества участников голосования в проекте
   */
  inline void increment_total_voters(eosio::name coopname, const checksum256 &project_hash) {
    auto exist_project = get_project_or_fail(coopname, project_hash);
    
    project_index projects(_capital, coopname.value);
    auto project = projects.find(exist_project.id);
    
    projects.modify(project, _capital, [&](auto &p) {
      p.voting.total_voters++;
    });
  }



  /**
   * @brief Инициализирует данные голосования в проекте
   * @param coopname Имя кооператива
   * @param project_hash Хэш проекта
   * @param amounts Рассчитанные суммы для голосования
   */
  inline void initialize_voting_amounts(eosio::name coopname, const checksum256 &project_hash, 
                                   const voting_amounts &amounts) {
    auto exist_project = get_project_or_fail(coopname, project_hash);
    
    project_index projects(_capital, coopname.value);
    auto project_itr = projects.find(exist_project.id);
    
    projects.modify(project_itr, _capital, [&](auto &p) {
      p.voting.amounts = amounts;
    });
  }


}// namespace Project