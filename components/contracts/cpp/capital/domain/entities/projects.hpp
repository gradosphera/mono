#pragma once

#include "plan_pool.hpp"
#include "fact_pool.hpp" 
#include "crps.hpp"
#include "generation_amounts.hpp"
#include "votes.hpp"
#include "counts.hpp"
#include "membership_crps.hpp"
#include "global_state.hpp"

using namespace eosio;
using std::string;


namespace Capital::Projects::Status {
  /**
  * @brief Константы статусов проекта
  */
  const eosio::name PENDING = "pending"_n;     ///< Проект создан
  const eosio::name ACTIVE = "active"_n;       ///< Проект активен для коммитов
  const eosio::name VOTING = "voting"_n;       ///< Проект на голосовании
  const eosio::name COMPLETED = "completed"_n; ///< Проект завершен
  const eosio::name CLOSED = "closed"_n;       ///< Проект закрыт
}// namespace Capital::Projects::Status


namespace Capital {
/**
* @brief Таблица проектов
*/
struct [[eosio::table, eosio::contract(CAPITAL)]] project {
  uint64_t id;
  
  name coopname; // Имя кооператива
  checksum256 project_hash; // Хэш проекта
  checksum256 parent_hash; // Хэш родительского проекта (если есть)
  
  eosio::name status; // Статус проекта
  
  bool is_opened; // Открыт ли проект для инвестиций
  
  // Мастер проекта
  name master; // Мастер проекта
  
  std::string title; // Название проекта
  std::string description; // Описание проекта
  std::string meta; // Метаданные проекта

  counts_data counts; // Счетчики участников проекта
  
  plan_pool plan; // Плановые показатели
  fact_pool fact; // Фактические показатели
  crps_data crps; // Данные CRPS для распределения наград
  
  // Голосование по методу Водянова
  voting_data voting; // Данные голосования по методу Водянова
  
  // Членские взносы
  membership_crps membership; // Данные CRPS для распределения членских взносов

  // Время создания проекта
  time_point_sec created_at = current_time_point();
  
  uint64_t primary_key() const { return id; }
  uint64_t by_created_at() const { return created_at.sec_since_epoch(); }
  checksum256 by_hash() const { return project_hash; }
  checksum256 by_parent_hash() const { return parent_hash; }
};

typedef eosio::multi_index<"projects"_n, project,
  indexed_by<"bycreatedat"_n, const_mem_fun<project, uint64_t, &project::by_created_at>>,
  indexed_by<"byhash"_n, const_mem_fun<project, checksum256, &project::by_hash>>,
  indexed_by<"byparenthash"_n, const_mem_fun<project, checksum256, &project::by_parent_hash>>
> project_index;

}// namespace Capital

namespace Capital::Projects {
  /**
   * @brief Получает проект по хэшу
   * 
   * @param coopname Имя кооператива
   * @param project_hash Хэш проекта
   * @return Опциональный проект
   */
  inline std::optional<project> get_project(eosio::name coopname, const checksum256 &project_hash) {
    project_index projects(_capital, coopname.value);
    auto project_hash_index = projects.get_index<"byhash"_n>();

    auto project_itr = project_hash_index.find(project_hash);
    if (project_itr == project_hash_index.end()) {
        return std::nullopt;
    }

    return *project_itr;
  }

  /**
   * @brief Получает проект по хэшу, если проект не найден, выбрасывает исключение
   * 
   * @param coopname Имя кооператива
   * @param project_hash Хэш проекта
   * @return project 
   */
  inline project get_project_or_fail(eosio::name coopname, const checksum256 &project_hash) {
    auto project = get_project(coopname, project_hash);
    eosio::check(project.has_value(), "Проект с указанным хэшем не найден");
    return *project;
  }

  /**
   * @brief Проверяет валидность parent_hash согласно правилам проектов
   * 
   * @param coopname Имя кооператива
   * @param parent_hash Хэш родительского проекта для проверки
   */
  inline void validate_parent_hash(eosio::name coopname, const checksum256 &parent_hash) {
    checksum256 empty_hash = checksum256();
    
    if (parent_hash != empty_hash) {
        auto parent_project = get_project_or_fail(coopname, parent_hash);
        eosio::check(parent_project.parent_hash == empty_hash, 
                     "Запрещено создавать проекты глубже одного уровня. У родительского проекта не должно быть своего родителя");
    }
  }

  /**
   * @brief Создает проект
   * 
   * @param coopname Имя кооператива
   * @param project_hash Хэш проекта
   * @param parent_hash Хэш родительского проекта (если есть)
   * @param title Название проекта  
   * @param description Описание проекта
   * @param meta Метаданные проекта
   */
  inline void create_project(eosio::name coopname, const checksum256 &project_hash, const checksum256 &parent_hash, const std::string &title, const std::string &description, const std::string &meta) {
    
    project_index projects(_capital, coopname.value);    
    
    projects.emplace(coopname, [&](auto& row) {
      row.id = get_global_id_in_scope(_capital, coopname, "projects"_n); 
      row.status = Capital::Projects::Status::PENDING;
      row.project_hash = project_hash;
      row.parent_hash = parent_hash;
      row.coopname = coopname;
      row.title = title;
      row.description = description;
      row.meta = meta;
    });
  }

    /**
   * @brief Добавляет коммит к проекту, обновляя фактические показатели и счетчик коммитов.
   * @param coopname Имя кооператива (scope таблицы).
   * @param project_hash Хэш проекта.
   * @param delta Фактические показатели взноса в проект.
   */
  inline void add_commit(eosio::name coopname, const checksum256 &project_hash, const generation_amounts &delta) {
      auto exist_project = get_project(coopname, project_hash);
      eosio::check(exist_project.has_value(), "Проект не найден");
      
      project_index projects(_capital, coopname.value);
      auto project = projects.find(exist_project->id);
      
      projects.modify(project, _capital, [&](auto &p) {
          // Увеличиваем счетчик коммитов
          p.counts.total_commits++;
          
          // Обновляем время создателей
          p.fact.creators_hours += delta.creators_hours;
          
          // Инкрементальное вычисление среднего для стоимости часа
          if (delta.hour_cost.amount > 0) {
              auto cost_diff = delta.hour_cost - p.fact.hour_cost;
              p.fact.hour_cost += asset(cost_diff.amount / p.counts.total_commits, p.fact.hour_cost.symbol);
          }
          
          // Обновляем остальные пулы  
          p.fact.creators_base_pool += delta.creators_base_pool;
          p.fact.authors_base_pool += delta.authors_base_pool;
          p.fact.authors_bonus_pool += delta.authors_bonus_pool;
          p.fact.creators_bonus_pool += delta.creators_bonus_pool;
          p.fact.total_generation_pool += delta.total_generation_pool;
          p.fact.contributors_bonus_pool += delta.contributors_bonus_pool;
          p.fact.total_contribution += delta.total_contribution;
          p.fact.total = p.fact.total_contribution + p.fact.used_expense_pool;
          
          // Пересчитываем коэффициенты
          p.fact.return_base_percent = Capital::Core::Generation::calculate_return_base_percent(p.fact.creators_base_pool, p.fact.authors_base_pool, p.fact.coordinators_base_pool, p.fact.invest_pool);
          p.fact.use_invest_percent = Capital::Core::Generation::calculate_use_invest_percent(p.fact.creators_base_pool, p.fact.authors_base_pool, p.fact.coordinators_base_pool, p.fact.accumulated_expense_pool, p.fact.used_expense_pool, p.fact.total_received_investments);
      });
  }
  
  /**
   * @brief Назначает мастера проекта
   * 
   * @param coopname Имя кооператива
   * @param project_id ID проекта
   * @param master Имя мастера
   */
  inline void set_master(eosio::name coopname, uint64_t project_id, eosio::name master) {
    Capital::project_index projects(_capital, coopname.value);
    auto project_itr = projects.find(project_id);
    
    projects.modify(project_itr, coopname, [&](auto &p) {
        p.master = master;
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
  inline void set_plan(eosio::name coopname, const checksum256 &project_hash, const plan_pool &calculated_plan) {
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
          // Рассчитываем сколько средств еще нужно для достижения цели по расходам
          eosio::asset expense_gap = p.plan.target_expense_pool - p.fact.accumulated_expense_pool;
          
          // Рассчитываем какую часть инвестиций направить в пул расходов
          eosio::asset to_expense_pool = asset(0, _root_govern_symbol);
          
          if (expense_gap.amount > 0) {
              // Рассчитываем процент от инвестиций для пула расходов
              auto st = Capital::get_global_state(coopname);
              eosio::asset potential_to_expense = amount * st.config.expense_pool_percent / 100;
              
              // Но не больше, чем нужно для достижения цели
              to_expense_pool = (potential_to_expense.amount <= expense_gap.amount) ? potential_to_expense : expense_gap;
          }
          
          // Остальные средства идут в инвестиционный пул
          eosio::asset to_invest_pool = amount - to_expense_pool;
          
          // Обновляем пулы
          p.fact.invest_pool += to_invest_pool;
          p.fact.accumulated_expense_pool += to_expense_pool;
          p.fact.total_received_investments += amount;  // Увеличиваем общую сумму полученных инвестиций
          
          // Пересчитываем коэффициенты возврата
          p.fact.return_base_percent = Capital::Core::Generation::calculate_return_base_percent(p.fact.creators_base_pool, p.fact.authors_base_pool, p.fact.coordinators_base_pool, p.fact.invest_pool);
          p.fact.use_invest_percent = Capital::Core::Generation::calculate_use_invest_percent(p.fact.creators_base_pool, p.fact.authors_base_pool, p.fact.coordinators_base_pool, p.fact.accumulated_expense_pool, p.fact.used_expense_pool, p.fact.total_received_investments);
      });
  }


  /**
   * @brief Увеличивает целевой размер пула расходов проекта.
   * @param coopname Имя кооператива (scope таблицы).
   * @param project_hash Хэш проекта.
   * @param additional_amount Дополнительная сумма для увеличения цели расходов.
   */
  inline void expand_expense_pool(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &additional_amount) {
      auto exist_project = get_project_or_fail(coopname, project_hash);
      
      project_index projects(_capital, coopname.value);
      auto project = projects.find(exist_project.id);
      
      projects.modify(project, coopname, [&](auto &p) {
          // Увеличиваем целевой размер пула расходов в фактических показателях
          p.fact.target_expense_pool += additional_amount;
      });
  }

  /**
   * @brief Открывает проект для инвестиций, копируя плановые показатели расходов в фактические.
   * @param coopname Имя кооператива (scope таблицы).
   * @param project_hash Хэш проекта.
   */
  inline void open_project(eosio::name coopname, const checksum256 &project_hash) {
      auto exist_project = get_project_or_fail(coopname, project_hash);
      
      project_index projects(_capital, coopname.value);
      auto project = projects.find(exist_project.id);
      
      projects.modify(project, coopname, [&](auto &p) {
          // Копируем целевые показатели расходов из плана в факт
          p.fact.target_expense_pool = p.plan.target_expense_pool;
          
          // Остальные поля расходов остаются нулевыми (accumulated_expense_pool, used_expense_pool)
          // так как фактических поступлений и трат еще не было
          
          // Меняем статус на "opened"
          p.is_opened = true;
      });
  }

  /**
   * @brief Резервирует средства для расхода, уменьшая accumulated_expense_pool.
   * @param coopname Имя кооператива.
   * @param project_hash Хэш проекта.
   * @param amount Сумма для резервирования.
   */
  inline void reserve_expense_funds(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &amount) {
      auto exist_project = get_project_or_fail(coopname, project_hash);
      
      project_index projects(_capital, coopname.value);
      auto project = projects.find(exist_project.id);
      
      projects.modify(project, coopname, [&](auto &p) {
          eosio::check(p.fact.accumulated_expense_pool >= amount, 
                       "Недостаточно средств в пуле расходов");
          p.fact.accumulated_expense_pool -= amount;
      });
  }

  /**
   * @brief Возвращает зарезервированные средства в accumulated_expense_pool.
   * @param coopname Имя кооператива.
   * @param project_hash Хэш проекта.
   * @param amount Сумма для возврата.
   */
  inline void return_expense_funds(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &amount) {
      auto exist_project = get_project_or_fail(coopname, project_hash);
      
      project_index projects(_capital, coopname.value);
      auto project = projects.find(exist_project.id);
      
      projects.modify(project, coopname, [&](auto &p) {
          p.fact.accumulated_expense_pool += amount;
      });
  }

  /**
   * @brief Завершает расход, добавляя сумму в used_expense_pool.
   * @param coopname Имя кооператива.
   * @param project_hash Хэш проекта.
   * @param amount Сумма расхода.
   */
  inline void complete_expense(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &amount) {
      auto exist_project = get_project_or_fail(coopname, project_hash);
      
      project_index projects(_capital, coopname.value);
      auto project = projects.find(exist_project.id);
      
      projects.modify(project, coopname, [&](auto &p) {
          p.fact.used_expense_pool += amount;
      });
  }
  
  
  /**
   * @brief Увеличивает количество инвесторов в проекте на 1
   */
   inline void increment_total_investors(eosio::name coopname, const checksum256 &project_hash) {
    project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      p.counts.total_investors += 1;
    });
  }

  /**
   * @brief Увеличивает количество зарегистрированных вкладчиков в проекте на 1
   */
  inline void increment_total_contributors(eosio::name coopname, const checksum256 &project_hash) {
    project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      p.counts.total_contributors += 1;
    });
  }

  /**
   * @brief Увеличивает количество вкладчических долей в проекте на указанное количество
   */
  inline void increment_total_contributor_shares(eosio::name coopname, const checksum256 &project_hash, eosio::asset shares) {
    project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      p.crps.total_capital_contributors_shares += shares;
    });
  }
  
  /**
   * @brief Увеличивает количество авторов в проекте на 1
   */
  inline void increment_total_authors(eosio::name coopname, const checksum256 &project_hash) {
    project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      p.counts.total_authors += 1;
    });
  }
  
    /**
   * @brief Увеличивает количество координаторов в проекте на 1
   */
  inline void increment_total_coordinators(eosio::name coopname, const checksum256 &project_hash) {
    project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      p.counts.total_coordinators += 1;
    });
  }
  
  /**
   * @brief Увеличивает количество создателей в проекте на 1
   */
  inline void increment_total_creators(eosio::name coopname, const checksum256 &project_hash) {
    project_index projects(_capital, coopname.value);
    auto project = projects.find(Capital::Projects::get_project_or_fail(coopname, project_hash).id);
    
    projects.modify(project, _capital, [&](auto &p) {
      p.counts.total_creators += 1;
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


  /**
   * @brief Уменьшает доли от общего пула долей проекта
   * @param coopname Имя кооператива
   * @param project_hash Хэш проекта
   * @param shares_amount Сумма долей для вычитания
   */
  inline void subtract_project_shares(eosio::name coopname, const checksum256 &project_hash, 
                                     const eosio::asset &shares_amount) {
    if (shares_amount.amount <= 0) {
      return; // Не вычитаем нулевые или отрицательные суммы
    }
    
    auto exist_project = get_project_or_fail(coopname, project_hash);
    
    project_index projects(_capital, coopname.value);
    auto project_itr = projects.find(exist_project.id);
    
    projects.modify(project_itr, _capital, [&](auto &p) {
      eosio::check(p.membership.total_shares >= shares_amount, 
                   "Недостаточно долей в проекте для вычитания");
      
      p.membership.total_shares -= shares_amount;
    });
  }

  /**
   * @brief Добавляет доли в общий пул долей проекта (только от конвертации в кошелек проекта)
   * @param coopname Имя кооператива
   * @param project_hash Хэш проекта
   * @param shares_amount Сумма долей для добавления
   */
  inline void add_project_membership_shares(eosio::name coopname, const checksum256 &project_hash, 
                                           const eosio::asset &shares_amount) {
    if (shares_amount.amount <= 0) {
      return; // Не добавляем нулевые или отрицательные суммы
    }
    
    auto exist_project = get_project_or_fail(coopname, project_hash);
    
    project_index projects(_capital, coopname.value);
    auto project_itr = projects.find(exist_project.id);
    
    projects.modify(project_itr, _capital, [&](auto &p) {
      p.membership.total_shares += shares_amount;
    });
  }

  /**
   * @brief Добавляет сконвертированные средства в проект
   * @param coopname Имя кооператива
   * @param project_hash Хэш проекта
   * @param converted_amount Сумма сконвертированных средств
   */
  inline void add_project_converted_funds(eosio::name coopname, const checksum256 &project_hash, 
                                         const eosio::asset &converted_amount) {
    if (converted_amount.amount <= 0) {
      return; // Не добавляем нулевые или отрицательные суммы
    }
    
    auto exist_project = get_project_or_fail(coopname, project_hash);
    
    project_index projects(_capital, coopname.value);
    auto project_itr = projects.find(exist_project.id);
    
    projects.modify(project_itr, _capital, [&](auto &p) {
      p.membership.converted_funds += converted_amount;
    });
  }

  inline void distribute_membership_funds(eosio::name coopname, const checksum256 &project_hash, asset amount) {
    auto exist_project = get_project_or_fail(coopname, project_hash);
    
    project_index projects(_capital, coopname.value);
    auto project_itr = projects.find(exist_project.id);
    
    projects.modify(project_itr, _capital, [&](auto &p) {
      p.membership.distributed += amount;
    });
  }

  /**
   * @brief Вычитает доступные членские средства из проекта
   * @param coopname Имя кооператива
   * @param project_hash Хэш проекта
   * @param amount Сумма для вычитания
   */
  inline void subtract_membership_available(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &amount) {
    if (amount.amount <= 0) {
      return; // Не вычитаем нулевые или отрицательные суммы
    }
    
    auto exist_project = get_project_or_fail(coopname, project_hash);
    
    project_index projects(_capital, coopname.value);
    auto project_itr = projects.find(exist_project.id);
    
    projects.modify(project_itr, _capital, [&](auto &p) {
      eosio::check(p.membership.available >= amount, 
                   "Недостаточно доступных членских средств в проекте");
      
      p.membership.available -= amount;
    });
  }

  /**
   * @brief Добавляет доступные членские средства в проект
   * @param coopname Имя кооператива
   * @param project_hash Хэш проекта
   * @param amount Сумма для добавления
   */
  inline void add_membership_available(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &amount) {
    if (amount.amount <= 0) {
      return; // Не добавляем нулевые или отрицательные суммы
    }
    
    auto exist_project = get_project_or_fail(coopname, project_hash);
    
    project_index projects(_capital, coopname.value);
    auto project_itr = projects.find(exist_project.id);
    
    projects.modify(project_itr, _capital, [&](auto &p) {
      p.membership.available += amount;
    });
  }

  
  inline void increase_total_returned_investments(eosio::name coopname, const uint64_t &project_id, const eosio::asset &amount) {
    // Обновляем проект - увеличиваем сумму возвращенных инвестиций
    Capital::project_index projects(_capital, coopname.value);
    auto project_itr = projects.find(project_id);
    
    projects.modify(project_itr, coopname, [&](auto &p) {
      p.fact.total_returned_investments += amount;
    });

    
  }
  
}// namespace Project