#include "core.hpp"

using namespace eosio;
using std::string;

namespace Capital::Core {
  
  /**
  * @brief Распределяет авторские средства между всеми авторами проекта пропорционально их долям.
  * @param coopname Имя кооператива (scope таблицы).
  * @param project_hash Хэш проекта.
  * @param delta_pools Объект с изменениями пулов.
  */
  void distribute_author_rewards(eosio::name coopname, const checksum256 &project_hash, const pools &delta_pools) {
    // Получаем всех авторов проекта
    auto authors = Circle::get_project_authors(coopname, project_hash);
    
    // Сначала подсчитываем общее количество авторских долей в проекте
    uint64_t total_author_shares = 0;
    for (const auto& author : authors) {
        total_author_shares += author.author_shares;
    }
    
    // Если нет авторов, то нечего распределять
    if (total_author_shares == 0 || authors.empty()) {
        return;
    }
    
    // Распределяем средства пропорционально долям
    Circle::segments_index segments(_capital, coopname.value);
    for (const auto& author_segment : authors) {
        auto segment_it = segments.find(author_segment.id);
        
        // Вычисляем долю автора
        double author_ratio = static_cast<double>(author_segment.author_shares) / static_cast<double>(total_author_shares);
        
        // Вычисляем суммы для данного автора
        eosio::asset author_base_share = eosio::asset(
            static_cast<int64_t>(delta_pools.authors_base_pool.amount * author_ratio), 
            delta_pools.authors_base_pool.symbol
        );
        eosio::asset author_bonus_share = eosio::asset(
            static_cast<int64_t>(delta_pools.authors_bonus_pool.amount * author_ratio), 
            delta_pools.authors_bonus_pool.symbol
        );
        
        // Обновляем сегмент автора
        segments.modify(segment_it, _capital, [&](auto &g) {
            g.author_base += author_base_share;
            g.author_bonus += author_bonus_share;
        });
    }
  }
  /**
  * @brief Функция расчета премий вкладчиков
  */
  eosio::asset calculate_contributors_bonus_pool(const pools& fact) {
    return eosio::asset(int64_t(static_cast<double>(
      fact.creators_base_pool.amount + 
      fact.authors_base_pool.amount + 
      fact.creators_bonus_pool.amount + 
      fact.authors_bonus_pool.amount +
      fact.coordinators_base_pool.amount
    ) * 1.618), _root_govern_symbol);
  }
  
  /**
  * @brief Функция расчета коэффициента возврата себестоимости
  */
  double calculate_return_cost_coefficient(const pools& current_pools) {
    if (current_pools.invest_pool.amount == 0) {
      return 0.0;
    }
    
    double total_costs = static_cast<double>(
      current_pools.creators_base_pool.amount +
      current_pools.authors_base_pool.amount +
      current_pools.coordinators_base_pool.amount +
      current_pools.expenses_pool.amount
    );
    
    double total_investments = static_cast<double>(current_pools.invest_pool.amount);
    
    return total_costs / total_investments;
  }

  /**
  * @brief Функция расчета плановых показателей проекта
  */
  pools calculate_plan_generation_amounts(
    const eosio::asset& plan_hour_cost,
    const uint64_t& plan_creators_hours,
    const eosio::asset& plan_expenses
  ) {
    pools plan;
    
    // устанавливаем стоимость часа и время
    plan.hour_cost = plan_hour_cost;
    plan.creators_hours = plan_creators_hours;
    plan.expenses_pool = plan_expenses;
    
    // расчет плановой себестоимости создателя (double)
    double creator_double_amount = static_cast<double>(plan_creators_hours) * static_cast<double>(plan_hour_cost.amount);
    
    // расчет плановой себестоимости создателя
    plan.creators_base_pool = asset(int64_t(creator_double_amount), _root_govern_symbol);
    
    // расчет авторской себестоимости (double)
    double author_double_amount = static_cast<double>(creator_double_amount * 0.618);
          
    // расчет авторской себестоимости
    plan.authors_base_pool = eosio::asset(int64_t(author_double_amount), _root_govern_symbol);
    
    // расчет планируемых премий координаторов
    plan.coordinators_base_pool = (plan.creators_base_pool + plan.authors_base_pool + plan.expenses_pool) * COORDINATOR_PERCENT;

    // расчет планируемой суммы инвестиций
    plan.invest_pool = plan.creators_base_pool + plan.authors_base_pool + plan.coordinators_base_pool + plan.expenses_pool;

    // расчет суммы, которую координаторы привлекут в проект
    // считаем, что координаторы будут привлекать всю сумму инвестиций
    plan.coordinators_investment_pool = plan.invest_pool;    
    
    // коэффициент возврата себестоимости для плана будет равен 1, т.к. мы планируем привлечение инвестиций в полном размере себестоимости
    plan.return_cost_coefficient = calculate_return_cost_coefficient(plan);
    
    // расчет премий вкладчиков
    plan.contributors_bonus_pool = calculate_contributors_bonus_pool(plan);
    
    return plan;
  }

  /**
   * @brief Функция расчета фактических показателей генерации в проекте по времени создателей
   */
  pools calculate_fact_generation_amounts(eosio::asset rate_per_hour, uint64_t creator_hours) {
    pools fact;
    
    // расчет фактических показателей генерации
    fact.creators_hours = creator_hours;
    fact.hour_cost = rate_per_hour;
    
    // расчет себестоимости создателя
    double creator_base_double = static_cast<double>(creator_hours) * static_cast<double>(rate_per_hour.amount);    
    fact.creators_base_pool = eosio::asset(int64_t(creator_base_double), _root_govern_symbol);
    
    // расчет премий создателя
    double creators_bonus_double = static_cast<double>(creator_base_double * 1);
    fact.creators_bonus_pool = eosio::asset(int64_t(creators_bonus_double), _root_govern_symbol);
    
    // расчет авторской себестоимости
    double author_base_double = static_cast<double>(creator_base_double * 0.618);
    fact.authors_base_pool = eosio::asset(int64_t(author_base_double), _root_govern_symbol);  // 0.618 от creator_base
    
    // расчет премий авторов
    fact.authors_bonus_pool = eosio::asset(int64_t(author_base_double * 0.618), _root_govern_symbol);
    
    // Координаторские поля и инвестиции учитываются отдельно
    fact.coordinators_investment_pool = eosio::asset(0, _root_govern_symbol);
    fact.coordinators_base_pool = eosio::asset(0, _root_govern_symbol);
    
    // Пул входящих инвестиций
    fact.invest_pool = eosio::asset(0, _root_govern_symbol);
    
    // Расходы также учитываются отдельно
    fact.expenses_pool = eosio::asset(0, _root_govern_symbol);
    
    // расчитываем отдельно на каждой инвестиции
    fact.return_cost_coefficient = 0;
    
    // Расчет премий вкладчиков
    fact.contributors_bonus_pool = calculate_contributors_bonus_pool(fact);
    
    return fact;
  }

  /**
  * @brief Функция расчета премий координаторов от инвестиций
  */
  eosio::asset calculate_coordinator_bonus_from_investment(const eosio::asset& investment_amount) {
    double amount = static_cast<double>(investment_amount.amount);
    eosio::symbol sym = investment_amount.symbol;
    
    // Рассчитываем премию координатора от инвестиций
    return eosio::asset(int64_t(amount * COORDINATOR_PERCENT / (1 + COORDINATOR_PERCENT)), sym);
  }

  /**
   * @brief Функция распределения членских взносов на проект
   * 
   */
  void distribute_project_membership_funds(eosio::name coopname, uint64_t project_id, asset amount, uint8_t level) {
    eosio::check(level < 12, "Превышено максимальное количество уровней распределения (12)");

    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(project_id);
    eosio::check(project != projects.end(), "Проект не найден");

    double ratio = project -> parent_distribution_ratio;

    int64_t membership_parent_fund_amount = static_cast<int64_t>(amount.amount * ratio);
    int64_t membership_current_fund_amount = amount.amount - membership_parent_fund_amount;

    asset membership_parent_fund(membership_parent_fund_amount, amount.symbol);
    asset membership_current_fund(membership_current_fund_amount, amount.symbol);

    projects.modify(project, coopname, [&](auto &p) {
        p.membership_funded += amount;
        p.membership_available += membership_current_fund;

        if (project -> total_share_balance.amount > 0) {
            int64_t delta = (membership_current_fund.amount * REWARD_SCALE) / project->total_share_balance.amount;
            p.membership_cumulative_reward_per_share += delta;
        };
    });

    if (ratio > 0 && project -> parent_project_hash != checksum256()) {
        auto parent_project = Capital::Projects::get_project(coopname, project -> parent_project_hash);
        eosio::check(parent_project.has_value(), "Родительский проект не найден");

        distribute_project_membership_funds(coopname, parent_project->id, membership_parent_fund, level + 1);
    };
  };

  /**
   * @brief Функция получения баланса паевых взносов по программе капитализации
   */
  int64_t get_capital_program_share_balance(eosio::name coopname) {
    auto capital_program = get_capital_program_or_fail(coopname);
    
    return capital_program.available -> amount + capital_program.blocked -> amount;
  }

  /**
   * @brief Функция получения баланса паевых взносов пользователя в программе капитализации
   */
  int64_t get_capital_user_share_balance(eosio::name coopname, eosio::name username) {
    auto wallet = Capital::get_capital_wallet(coopname, username);
    eosio::check(wallet.has_value(), "Кошелёк пайщика в программе не найден");

    return wallet -> available.amount + wallet -> blocked -> amount;
  }


} // namespace Capital::Core