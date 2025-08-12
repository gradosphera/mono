using namespace eosio;
using std::string;

namespace Capital::Core {
  
  /**
   * @brief Добавляет средства в глобальный пул доступных инвестиций программы
   */
  void add_program_investment_funds(eosio::name coopname, asset amount) {
    auto state = Capital::get_global_state(coopname);
    
    // Добавляем средства в глобальный пул доступных для аллокации инвестиций
    state.global_available_invest_pool += amount;

    update_global_state(state);
  }

  /**
   * @brief Аллоцирует средства из глобального пула в проект согласно правилу распределения
   * @param coopname Имя кооператива
   * @param project_hash Хэш проекта
   * @param amount Сумма для аллокации
   */
  void allocate_program_investment_to_project(eosio::name coopname, const checksum256 &project_hash, eosio::asset amount) {
    auto state = Capital::get_global_state(coopname);
    
    // Проверяем что в глобальном пуле достаточно средств
    eosio::check(state.global_available_invest_pool >= amount, "Недостаточно средств в глобальном пуле инвестиций");
    
    auto exist_project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Получаем проект для модификации
    Capital::project_index projects(_capital, coopname.value);
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
      
      // Остальные средства идут в инвестиционные пулы
        eosio::asset to_invest_pool = amount - to_expense_pool;
      
      // Обновляем пулы проекта
      // Добавляем в invest_pool для корректного расчета CRPS
      p.fact.invest_pool += to_invest_pool;
      // Также фиксируем в program_invest_pool для отслеживания программных средств
      p.fact.program_invest_pool += to_invest_pool;
      p.fact.accumulated_expense_pool += to_expense_pool;
      p.fact.total_received_investments += amount;  // Увеличиваем общую сумму полученных инвестиций
      
      // Пересчитываем коэффициенты возврата
      p.fact.return_base_percent = Capital::Core::Generation::calculate_return_base_percent(p.fact.creators_base_pool, p.fact.authors_base_pool, p.fact.coordinators_base_pool, p.fact.invest_pool);
      p.fact.use_invest_percent = Capital::Core::Generation::calculate_use_invest_percent(p.fact.creators_base_pool, p.fact.authors_base_pool, p.fact.coordinators_base_pool, p.fact.accumulated_expense_pool, p.fact.used_expense_pool, p.fact.total_received_investments);
    });
    
    // Списываем средства из глобального пула
    state.global_available_invest_pool -= amount;
    update_global_state(state);
  }

  /**
   * @brief Диаллоцирует средства из проекта обратно в глобальный пул (после закрытия проекта)
   * @param coopname Имя кооператива
   * @param project_hash Хэш проекта
   * @param amount Сумма для диаллокации
   */
  void deallocate_program_investment_from_project(eosio::name coopname, const checksum256 &project_hash, eosio::asset amount) {
    auto exist_project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Получаем проект для модификации
    Capital::project_index projects(_capital, coopname.value);
    auto project = projects.find(exist_project.id);
    
    // Проверяем что в проекте достаточно программных средств
    eosio::check(project->fact.program_invest_pool >= amount, "Недостаточно программных средств в проекте");
    
    projects.modify(project, coopname, [&](auto &p) {
      // Списываем средства из программного инвестиционного пула проекта
      p.fact.program_invest_pool -= amount;
      // коэффициент возврата не трогаем т.к. проект уже закрыт
    });
    
    // Возвращаем средства в глобальный пул
    auto state = Capital::get_global_state(coopname);
    state.global_available_invest_pool += amount;
    update_global_state(state);
  }

} // namespace Capital::Core