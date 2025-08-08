#include "generation.hpp"
#include "../../entities/projects.hpp"
#include "../crps/crps.hpp"

using namespace eosio;
using std::string;

namespace Capital::Core::Generation {
  
  
  /**
  * @brief Функция расчета премий вкладчиков (для фактических показателей)
  */
  eosio::asset calculate_contributors_bonus_pool(eosio::asset total_generation_pool) {
    return eosio::asset(int64_t(static_cast<double>(
      total_generation_pool.amount
    ) * CONTRIBUTORS_BONUS_COEFFICIENT), _root_govern_symbol);
  }

  /**
  * @brief Функция расчета коэффициента возврата себестоимости (для фактических показателей)
  */
  double calculate_return_cost_coefficient(const fact_pool& current_pools) {
    // invest_pool теперь содержит все инвестиции (включая программные)
    if (current_pools.invest_pool.amount == 0) {
      return 0.0;
    }
    
    double total_costs = static_cast<double>(
      current_pools.creators_base_pool.amount +
      current_pools.authors_base_pool.amount +
      current_pools.coordinators_base_pool.amount +
      current_pools.target_expense_pool.amount
    );
    
    double total_investments = static_cast<double>(current_pools.invest_pool.amount);
    
    return total_costs / total_investments;
  }

  /**
  * @brief Функция расчета коэффициента возврата себестоимости (для плановых показателей)
  */
  double calculate_return_cost_coefficient(const plan_pool& current_pools) {
    // invest_pool теперь содержит все инвестиции (включая программные)
    if (current_pools.invest_pool.amount == 0) {
      return 0.0;
    }
    
    double total_costs = static_cast<double>(
      current_pools.creators_base_pool.amount +
      current_pools.authors_base_pool.amount +
      current_pools.coordinators_base_pool.amount +
      current_pools.target_expense_pool.amount
    );
    
    double total_investments = static_cast<double>(current_pools.invest_pool.amount);
    
    return total_costs / total_investments;
  }

  /**
  * @brief Функция расчета плановых показателей проекта
  */
  plan_pool calculate_plan_generation_amounts(
    eosio::name coopname,
    const eosio::asset& plan_hour_cost,
    const uint64_t& plan_creators_hours,
    const eosio::asset& plan_expenses
  ) {
    // читаем конфиг
    auto st = Capital::get_global_state(coopname);
    
    plan_pool plan;
    
    // устанавливаем стоимость часа и время
    plan.hour_cost = plan_hour_cost;
    plan.creators_hours = plan_creators_hours;
    
    // инициализируем поля расходов
    plan.target_expense_pool = plan_expenses; // планируемые расходы
    
    // расчет плановой себестоимости создателя (double)
    double creator_double_amount = static_cast<double>(plan_creators_hours) * static_cast<double>(plan_hour_cost.amount);
    
    // расчет плановой себестоимости создателя
    plan.creators_base_pool = asset(int64_t(creator_double_amount), _root_govern_symbol);
    
    // расчет авторской себестоимости (double)
    double author_double_amount = static_cast<double>(creator_double_amount * AUTHOR_BASE_COEFFICIENT);
          
    // расчет авторской себестоимости
    plan.authors_base_pool = eosio::asset(int64_t(author_double_amount), _root_govern_symbol);
    
    // расчет планируемых премий координаторов
    
    plan.coordinators_base_pool = (plan.creators_base_pool + plan.authors_base_pool + plan.target_expense_pool) * st.config.coordinator_bonus_percent;

    // расчет премий создателя
    double creators_bonus_double = static_cast<double>(plan.creators_base_pool.amount * CREATORS_BONUS_COEFFICIENT);
    plan.creators_bonus_pool = eosio::asset(int64_t(creators_bonus_double), _root_govern_symbol);
    
    // расчет премий авторов
    double authors_bonus_double = static_cast<double>(plan.authors_base_pool.amount * AUTHOR_BONUS_COEFFICIENT);
    plan.authors_bonus_pool = eosio::asset(int64_t(authors_bonus_double), _root_govern_symbol);
    
    // расчет планируемой суммы инвестиций
    plan.invest_pool = plan.creators_base_pool + plan.authors_base_pool + plan.coordinators_base_pool + plan.target_expense_pool;

    // расчет суммы, которую координаторы привлекут в проект
    // считаем, что координаторы будут привлекать всю сумму инвестиций
    plan.coordinators_investment_pool = plan.invest_pool;    
    
    // коэффициент возврата себестоимости для плана будет равен 1, т.к. мы планируем привлечение инвестиций в полном размере себестоимости
    plan.return_cost_coefficient = calculate_return_cost_coefficient(plan);
    
    plan.total_generation_pool = plan.creators_base_pool + plan.authors_base_pool + plan.coordinators_base_pool + plan.creators_bonus_pool + plan.authors_bonus_pool;
    
    // расчет премий вкладчиков
    plan.contributors_bonus_pool = calculate_contributors_bonus_pool(plan.total_generation_pool);
    
    // Общая планируемая сумма генерации с вкладчиками
    plan.total = plan.total_generation_pool + plan.contributors_bonus_pool + plan.target_expense_pool;
    
    return plan;
  }

  /**
   * @brief Функция расчета фактических показателей генерации в проекте по времени создателей
   */
  generation_amounts calculate_fact_generation_amounts(eosio::asset rate_per_hour, uint64_t creator_hours) {
    generation_amounts fact;
    
    // расчет фактических показателей генерации
    fact.creators_hours = creator_hours;
    fact.hour_cost = rate_per_hour;
    
    // расчет себестоимости создателя
    double creator_base_double = static_cast<double>(creator_hours) * static_cast<double>(rate_per_hour.amount);    
    fact.creators_base_pool = eosio::asset(int64_t(creator_base_double), _root_govern_symbol);
    
    // расчет премий создателя
    double creators_bonus_double = static_cast<double>(creator_base_double * CREATORS_BONUS_COEFFICIENT);
    fact.creators_bonus_pool = eosio::asset(int64_t(creators_bonus_double), _root_govern_symbol);
    
    // расчет авторской себестоимости
    double author_base_double = static_cast<double>(creator_base_double * AUTHOR_BASE_COEFFICIENT);
    fact.authors_base_pool = eosio::asset(int64_t(author_base_double), _root_govern_symbol);  // 0.618 от creator_base
    
    // расчет премий авторов
    fact.authors_bonus_pool = eosio::asset(int64_t(author_base_double * AUTHOR_BONUS_COEFFICIENT), _root_govern_symbol);
    
    // расчет общей суммы генерации коммита (без координаторов, они учитываются отдельно)
    fact.total_generation_pool = fact.creators_base_pool + fact.authors_base_pool + fact.creators_bonus_pool + fact.authors_bonus_pool;
    
    // Расчет премий вкладчиков от общей суммы генерации коммита
    fact.contributors_bonus_pool = eosio::asset(int64_t(static_cast<double>(
      fact.total_generation_pool.amount
    ) * CONTRIBUTORS_BONUS_COEFFICIENT), _root_govern_symbol);
    
    // Расчет общей суммы вкладов всех пайщиков (генерация + премии вкладчиков)
    fact.total_contribution = fact.total_generation_pool + fact.contributors_bonus_pool;
    
    return fact;
  }

  /**
  * @brief Функция расчета премий координаторов от инвестиций
  */
  eosio::asset calculate_coordinator_bonus_from_investment(name coopname, const eosio::asset& investment_amount) {
    auto st = Capital::get_global_state(coopname);
    double amount = static_cast<double>(investment_amount.amount);
    eosio::symbol sym = investment_amount.symbol;
    
    // Рассчитываем премию координатора от инвестиций
    double k = st.config.coordinator_bonus_percent;
    return eosio::asset(int64_t(amount * k / (1 + k)), sym);
  }

  /**
   * @brief Функция распределения членских взносов на проект
   * 
   */
  void distribute_project_membership_funds(eosio::name coopname, uint64_t project_id, asset amount) {
    
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(project_id);
    eosio::check(project != projects.end(), "Проект не найден");

    int64_t membership_current_fund_amount = amount.amount;

    asset membership_current_fund(membership_current_fund_amount, amount.symbol);

    projects.modify(project, coopname, [&](auto &p) {
        p.membership.funded += amount;
        p.membership.available += membership_current_fund;

        // Используем total_shares для расчета распределения на основе долей
        if (project -> membership.total_shares.amount > 0) {
            int64_t delta = membership_current_fund.amount / project->membership.total_shares.amount;
            p.membership.cumulative_reward_per_share += delta;
        };
    });
  };

  /**
   * @brief Рассчитывает фактически используемую сумму инвестора с учетом коэффициента возврата
   * @param investor_base Базовая сумма инвестора
   * @param return_cost_coefficient Коэффициент возврата себестоимости проекта
   * @return Фактически используемая сумма инвестора
   */
  eosio::asset calculate_investor_used_amount(const eosio::asset& investor_base, double return_cost_coefficient) {
    if (return_cost_coefficient <= 1.0) {
      // Если коэффициент <= 1, то все средства инвестора используются
      return investor_base;
    }
    
    // Если коэффициент > 1, то используется только часть средств инвестора
    // Используемая сумма = базовая_сумма / коэффициент
    double used_amount = static_cast<double>(investor_base.amount) / return_cost_coefficient;
    
    return eosio::asset(static_cast<int64_t>(used_amount), investor_base.symbol);
  }

  /**
   * @brief Добавляет координаторские средства к проекту
   * @param coopname Имя кооператива
   * @param project_hash Хеш проекта
   * @param amount Сумма координаторских взносов для добавления
   */
  void add_coordinator_funds(eosio::name coopname, const checksum256 &project_hash, const eosio::asset &amount) {
      auto exist_project = Capital::Projects::get_project_or_fail(coopname, project_hash);
      
      Capital::project_index projects(_capital, coopname.value);
      auto project = projects.find(exist_project.id);
      
      // Рассчитываем награду координаторов от инвестиций
      eosio::asset coordinator_base = calculate_coordinator_bonus_from_investment(coopname, amount);
      
      projects.modify(project, coopname, [&](auto &p) {
          // Накапливаем инвестиции, привлеченные координаторами  
          p.fact.coordinators_investment_pool += amount;
          
          // Накапливаем общий пул премий координаторов
          p.fact.coordinators_base_pool += coordinator_base;
          
          // Пересчитываем коэффициент возврата себестоимости
          p.fact.return_cost_coefficient = calculate_return_cost_coefficient(p.fact);
          
          // Пересчитываем премии вкладчиков, т.к. премии координаторов влияют на премии вкладчиков
          p.fact.contributors_bonus_pool = calculate_contributors_bonus_pool(p.fact.total_generation_pool);
          
          // Пересчитываем общую сумму вкладов всех пайщиков (генерация + премии вкладчиков)
          p.fact.total_contribution = p.fact.total_generation_pool + p.fact.contributors_bonus_pool;
          
          // Пересчитываем общую сумму с расходами
          p.fact.total = p.fact.total_contribution + p.fact.used_expense_pool;
      });

      // Распределяем награды координаторов через CRPS систему
      Capital::Core::update_coordinator_crps(coopname, project_hash, coordinator_base);
  }

} // namespace Capital::Core