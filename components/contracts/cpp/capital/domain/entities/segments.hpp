#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;

namespace Capital::Segments {
  /**
   * @brief Константы статусов сегмента
   */
   namespace Status {
    const eosio::name GENERATION = "generation"_n;         ///< На генерации результата
    const eosio::name READY = "ready"_n;         ///< Готов к конвертации
    const eosio::name CONTRIBUTED = "contributed"_n;   ///< Результат внесён, долг погашен, готов к конвертации
    const eosio::name ACCEPTED = "accepted"_n;   ///< Результат принят советом
    const eosio::name COMPLETED = "completed"_n;   ///< Сконвертирован
  }
  
/**
  * @brief Структура сегмента, хранящая данные о вкладах участника в проект.  
  */
  struct [[eosio::table, eosio::contract(CAPITAL)]] segment {
    uint64_t    id;                   // Идентификатор сегмента
    checksum256 project_hash;         // С каким проектом связан сегмент
    eosio::name coopname;             // Имя кооператива
    eosio::name username;             // Имя участника
    
    // Статус результата сегмента
    eosio::name status = Status::GENERATION; ///< generation | ready | contributed | accepted | completed

    // Роли участника в проекте
    bool is_author = false;          // Является ли участник автором
    bool is_creator = false;         // Является ли участник создателем  
    bool is_coordinator = false;     // Является ли участник координатором
    bool is_investor = false;        // Является ли участник инвестором
    bool is_contributor = false;     // Является ли участник вкладчиком
    
    
    /// Вклады
    // Основная информация о вкладе инвестора
    eosio::asset investor_amount = asset(0, _root_govern_symbol); //полная сумма инвестиций, которую инвестор внес в проект
    eosio::asset investor_base = asset(0, _root_govern_symbol); //фактически используемая сумма инвестора при коэффициенте возврата > 1
    
    // Основная информация о вкладе создателя
    eosio::asset creator_base = asset(0, _root_govern_symbol); //сумма себестоимости, которую создатель фактически потратил на выполнение проекта
    eosio::asset creator_bonus = asset(0, _root_govern_symbol); //сумма бонусов, которую создатель получил за выполнение проекта
    
    // Основная информация о вкладе автора
    eosio::asset author_base = asset(0, _root_govern_symbol); //сумма себестоимости, которую автор фактически потратил на выполнение проекта
    eosio::asset author_bonus = asset(0, _root_govern_symbol); //сумма бонусов, которую автор получил за выполнение проекта
    
    // Основная информация о вкладе координатора
    eosio::asset coordinator_investments = asset(0, _root_govern_symbol); //сумма инвестиций, которую координатор привлек в проект
    eosio::asset coordinator_base = asset(0, _root_govern_symbol); //сумма себестоимости, которую координатор фактически потратил на выполнение проекта
    
    // Основная информация о вкладе вкладчика
    eosio::asset contributor_bonus = asset(0, _root_govern_symbol); //сумма бонусов, которую вкладчик получил от проекта
      
    // CRPS поля для масштабируемого распределения наград
    int64_t last_author_base_reward_per_share = 0;         // Последняя зафиксированная базовая награда на долю для авторов  
    int64_t last_author_bonus_reward_per_share = 0;        // Последняя зафиксированная бонусная награда на долю для авторов
    int64_t last_coordinator_reward_per_share = 0;         // Последняя зафиксированная награда на долю для координаторов
    int64_t last_contributor_reward_per_share = 0;         // Последняя зафиксированная награда на долю для вкладчиков

    // Доли в программе и проекте
    eosio::asset capital_contributor_shares = asset(0, _root_govern_symbol); // Количество долей вкладчика в программе капитализации
    eosio::asset project_contributor_shares = asset(0, _root_govern_symbol); // Текущая доля участника в проекте (базовые_вклады - конвертации - ссуды)

    // Последняя известная сумма инвестиций в проекте для расчета provisional_amount
    eosio::asset last_known_invest_pool = asset(0, _root_govern_symbol);
    
    // Последняя известная сумма базового пула создателей для расчета использования инвестиций
    eosio::asset last_known_creators_base_pool = asset(0, _root_govern_symbol);
    
    // Финансовые данные для ссуд
    eosio::asset provisional_amount = asset(0, _root_govern_symbol); //доступная сумма для залога при получении ссуды
    eosio::asset debt_amount = asset(0, _root_govern_symbol); //сумма, которая уже выдана в ссуду
    eosio::asset debt_settled = asset(0, _root_govern_symbol); //сумма погашенных ссуд
    
    // Пулы равных премий авторов и прямых премий создателей
    eosio::asset equal_author_bonus = asset(0, _root_govern_symbol); //сумма равных премий авторам
    eosio::asset direct_creator_bonus = asset(0, _root_govern_symbol); //сумма прямых премий создателю
    
    // Результаты голосования по методу Водянова
    eosio::asset voting_bonus = asset(0, _root_govern_symbol);  //сумма от голосования авторского пула
    
    // Общая стоимость сегмента (рассчитывается автоматически)
    eosio::asset total_segment_base_cost = asset(0, _root_govern_symbol); //общая стоимость базовых вкладов сегмента
    eosio::asset total_segment_bonus_cost = asset(0, _root_govern_symbol); //общая стоимость бонусных вкладов сегмента
    eosio::asset total_segment_cost = asset(0, _root_govern_symbol); //общая стоимость всех вкладов сегмента
    
    eosio::asset available_base_after_pay_debt = asset(0, _root_govern_symbol); //базовая сумма доступная для конвертации после погашения долга
    
    eosio::asset converted_to_wallet = asset(0, _root_govern_symbol); //сумма, сконвертированная в кошелек
    eosio::asset converted_to_capital = asset(0, _root_govern_symbol); //сумма, сконвертированная в программу капитализации
    eosio::asset converted_to_project = asset(0, _root_govern_symbol); //сумма, сконвертированная в проект
        
    uint64_t primary_key() const { return id; }
    
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта
  
    // Индекс по (project_hash + username) - уникальный для каждого участника проекта
    uint128_t by_project_user() const {
        return combine_checksum_ids(project_hash, username);
    }
    
    // Индекс для поиска авторов в проекте
    uint128_t by_project_author() const {
        if (!is_author) return 0;
        return combine_checksum_ids(project_hash, eosio::name{"isauthor"});
    }
    
    // Индекс для поиска создателей в проекте
    uint128_t by_project_creator() const {
        if (!is_creator) return 0;
        return combine_checksum_ids(project_hash, eosio::name{"iscreator"});
    }
    
    // Индекс для поиска координаторов в проекте
    uint128_t by_project_coordinator() const {
        if (!is_coordinator) return 0;
        return combine_checksum_ids(project_hash, eosio::name{"iscoord"});
    }
    
    // Индекс для поиска инвесторов в проекте  
    uint128_t by_project_investor() const {
        if (!is_investor) return 0;
        return combine_checksum_ids(project_hash, eosio::name{"isinvestor"});
    }
    
    // Индекс для поиска вкладчиков в проекте  
    uint128_t by_project_contributor() const {
        if (!is_contributor) return 0;
        return combine_checksum_ids(project_hash, eosio::name{"iscontrib"});
    }
  };
  
  typedef eosio::multi_index<
    "segments"_n, segment,
    indexed_by<"byproject"_n, const_mem_fun<segment, checksum256, &segment::by_project_hash>>,
    indexed_by<"byprojuser"_n, const_mem_fun<segment, uint128_t, &segment::by_project_user>>,
    indexed_by<"byprojauth"_n, const_mem_fun<segment, uint128_t, &segment::by_project_author>>,
    indexed_by<"byprojcr"_n, const_mem_fun<segment, uint128_t, &segment::by_project_creator>>,
    indexed_by<"byprojcoord"_n, const_mem_fun<segment, uint128_t, &segment::by_project_coordinator>>,
    indexed_by<"byprojinv"_n, const_mem_fun<segment, uint128_t, &segment::by_project_investor>>,
    indexed_by<"byprojcontr"_n, const_mem_fun<segment, uint128_t, &segment::by_project_contributor>>
  > segments_index;

  
  inline std::optional<segment> get_segment(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    segments_index segments(_capital, coopname.value);
    auto idx  = segments.get_index<"byprojuser"_n>();
    auto rkey = combine_checksum_ids(project_hash, username);

    auto it = idx.find(rkey);
    if (it == idx.end()) {
        return std::nullopt;
    }
    return *it;
  }

  inline segment get_segment_or_fail(eosio::name coopname, const checksum256 &project_hash, eosio::name username, const char* msg) {
    auto maybe_segment = get_segment(coopname, project_hash, username);
    eosio::check(maybe_segment.has_value(), msg);
    return *maybe_segment;
  }

/**
 * @brief Получает всех авторов проекта.
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта.
 * @return Вектор сегментов авторов.
 */
inline std::vector<segment> get_project_authors(eosio::name coopname, const checksum256 &project_hash) {
    segments_index segments(_capital, coopname.value);
    auto project_idx = segments.get_index<"byproject"_n>();
    
    std::vector<segment> authors;
    auto itr = project_idx.find(project_hash);
    while (itr != project_idx.end() && itr->project_hash == project_hash) {
        if (itr->is_author) {
            authors.push_back(*itr);
        }
        ++itr;
    }
    return authors;
}

/**
 * @brief Получает всех создателей проекта.
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта.
 * @return Вектор сегментов создателей.
 */
inline std::vector<segment> get_project_creators(eosio::name coopname, const checksum256 &project_hash) {
    segments_index segments(_capital, coopname.value);
    auto project_idx = segments.get_index<"byproject"_n>();
    
    std::vector<segment> creators;
    auto itr = project_idx.find(project_hash);
    while (itr != project_idx.end() && itr->project_hash == project_hash) {
        if (itr->is_creator) {
            creators.push_back(*itr);
        }
        ++itr;
    }
    return creators;
}

/**
 * @brief Получает всех координаторов проекта.
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта.
 * @return Вектор сегментов координаторов.
 */
inline std::vector<segment> get_project_coordinators(eosio::name coopname, const checksum256 &project_hash) {
    segments_index segments(_capital, coopname.value);
    auto project_idx = segments.get_index<"byproject"_n>();
    
    std::vector<segment> coordinators;
    auto itr = project_idx.find(project_hash);
    while (itr != project_idx.end() && itr->project_hash == project_hash) {
        if (itr->is_coordinator) {
            coordinators.push_back(*itr);
        }
        ++itr;
    }
    return coordinators;
}

/**
 * @brief Получает всех инвесторов проекта.
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта.
 * @return Вектор сегментов инвесторов.
 */
inline std::vector<segment> get_project_investors(eosio::name coopname, const checksum256 &project_hash) {
    segments_index segments(_capital, coopname.value);
    auto project_idx = segments.get_index<"byproject"_n>();
    
    std::vector<segment> investors;
    auto itr = project_idx.find(project_hash);
    while (itr != project_idx.end() && itr->project_hash == project_hash) {
        if (itr->is_investor) {
            investors.push_back(*itr);
        }
        ++itr;
    }
    return investors;
}

/**
 * @brief Подсчитывает количество авторов в проекте.
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта.
 * @return Количество авторов.
 */
inline uint64_t count_project_authors(eosio::name coopname, const checksum256 &project_hash) {
    segments_index segments(_capital, coopname.value);
    auto project_idx = segments.get_index<"byproject"_n>();
    
    uint64_t count = 0;
    auto itr = project_idx.find(project_hash);
    while (itr != project_idx.end() && itr->project_hash == project_hash) {
        if (itr->is_author) {
            count++;
        }
        ++itr;
    }
    return count;
}

/**
 * @brief Проверяет является ли пользователь участником голосования
 * @param coopname Имя кооператива
 * @param project_hash Хэш проекта  
 * @param username Имя пользователя
 * @return true если у пользователя есть право голоса
 */
inline bool is_voting_participant(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    auto segment = get_segment(coopname, project_hash, username);
    return segment.has_value() && segment->is_author && segment->is_creator;
}

/**
 * @brief Проверяет является ли сегмент обновленным (CRPS актуален и инвестиции синхронизированы)
 * @param coopname Имя кооператива
 * @param project_hash Хэш проекта
 * @param username Имя пользователя
 * @return true если сегмент обновлен
 */
inline bool is_segment_updated(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    auto segment_opt = get_segment(coopname, project_hash, username);
    if (!segment_opt.has_value()) {
        return false; // Сегмент не найден
    }
    
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Проверяем актуальность CRPS для каждой роли
    bool author_updated = (!segment_opt->is_author) || 
                         (segment_opt->last_author_base_reward_per_share == project.crps.author_base_cumulative_reward_per_share &&
                          segment_opt->last_author_bonus_reward_per_share == project.crps.author_bonus_cumulative_reward_per_share);
    
    // Координаторы используют пропорциональное распределение, проверяем что есть изменения в пулах
    bool coordinator_updated = (!segment_opt->is_coordinator) || 
                              (project.fact.coordinators_base_pool.amount == 0 || 
                               project.fact.coordinators_investment_pool.amount == 0);
    
    bool contributor_updated = (!segment_opt->is_contributor) || 
                              (segment_opt->last_contributor_reward_per_share == project.crps.contributor_cumulative_reward_per_share);
    
    // Проверяем актуальность инвестиционного пула для расчета provisional_amount (нужно всем ролям)
    bool invest_pool_updated = (segment_opt->last_known_invest_pool == project.fact.invest_pool);
    
    // Проверяем актуальность базового пула создателей для корректного расчета использования инвестиций (нужно только инвесторам)
    bool creators_base_pool_updated = (!segment_opt->is_investor) || 
                                     (segment_opt->last_known_creators_base_pool == project.fact.creators_base_pool);
    
    return author_updated && coordinator_updated && contributor_updated && invest_pool_updated && creators_base_pool_updated;
}

/**
 * @brief Проверяет является ли сегмент обновленным или падает с ошибкой
 */
inline void check_segment_is_updated(eosio::name coopname, const checksum256 &project_hash, eosio::name username, 
                                   const char* msg = "Сегмент не обновлен. Необходимо выполнить rfrshsegment") {
    eosio::check(is_segment_updated(coopname, project_hash, username), msg);
}

/**
 * @brief Рассчитывает базовую стоимость сегмента
 * @param segment Сегмент для расчёта
 * @return Базовая стоимость сегмента
 */
inline eosio::asset calculate_segment_base_cost(const segment& seg) {
    eosio::asset total = asset(0, _root_govern_symbol);
    
    // Базовые вклады (всегда учитываются)
    total += seg.investor_base; // фактически используемая сумма инвестора
    total += seg.creator_base;
    total += seg.author_base;
    total += seg.coordinator_base;
    
    return total;
}

/**
 * @brief Рассчитывает бонусную стоимость сегмента
 * @param segment Сегмент для расчёта
 * @param project Проект для определения, прошло ли голосование
 * @return Бонусная стоимость сегмента
 */
inline eosio::asset calculate_segment_bonus_cost(const segment& seg, const Capital::project& project) {
    eosio::asset total = asset(0, _root_govern_symbol);
    
    // Премии зависят от статуса проекта
    if (project.status == Capital::Projects::Status::COMPLETED) {
        // После голосования используем результаты голосования
        total += seg.equal_author_bonus;
        total += seg.direct_creator_bonus;
        total += seg.voting_bonus;
    } else {
        // До голосования используем полные суммы премий
        total += seg.creator_bonus;
        total += seg.author_bonus;
    }
    
    // Премии вкладчиков
    total += seg.contributor_bonus;
    
    return total;
}

/**
 * @brief Рассчитывает общую стоимость сегмента
 * @param segment Сегмент для расчёта
 * @param project Проект для определения, прошло ли голосование
 * @return Общая стоимость сегмента
 */
inline eosio::asset calculate_total_segment_cost(const segment& seg, const Capital::project& project) {
    return calculate_segment_base_cost(seg) + calculate_segment_bonus_cost(seg, project);
}

/**
 * @brief Обновляет все стоимости сегмента (базовые, бонусные и общую)
 */
inline void update_segment_total_cost(eosio::name coopname, const checksum256 &project_hash, eosio::name username, eosio::name application) {
    segments_index segments(_capital, coopname.value);
    auto idx = segments.get_index<"byprojuser"_n>();
    auto key = combine_checksum_ids(project_hash, username);
    auto segment_itr = idx.find(key);
    
    eosio::check(segment_itr != idx.end(), "Сегмент участника не найден");
    
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    idx.modify(segment_itr, application, [&](auto &s) {
        s.total_segment_base_cost = calculate_segment_base_cost(s);
        s.total_segment_bonus_cost = calculate_segment_bonus_cost(s, project);
        s.total_segment_cost = s.total_segment_base_cost + s.total_segment_bonus_cost;
    });
}

/**
 * @brief Обновляет сегмент после конвертации
 */
inline void update_segment_conversion(eosio::name coopname, const checksum256 &project_hash,
                                     eosio::name username, eosio::name application,
                                     const eosio::asset &wallet_amount, const eosio::asset &capital_amount,
                                     const eosio::asset &project_amount) {
    segments_index segments(_capital, coopname.value);
    auto idx = segments.get_index<"byprojuser"_n>();
    auto key = combine_checksum_ids(project_hash, username);
    auto segment_itr = idx.find(key);
    
    eosio::check(segment_itr != idx.end(), "Сегмент участника не найден");
    
    idx.modify(segment_itr, application, [&](auto &s) {
        s.converted_to_wallet = wallet_amount;
        s.converted_to_capital = capital_amount;
        s.converted_to_project = project_amount;
        
        s.status = Capital::Segments::Status::COMPLETED; // Смешанная конвертация
    });
}

  /**
   * @brief Обновляет статус результата в сегменте
   */
  inline void update_segment_status(eosio::name coopname, const checksum256 &project_hash, 
                                        eosio::name username, eosio::name new_status) {
    segments_index segments(_capital, coopname.value);
    auto idx = segments.get_index<"byprojuser"_n>();
    auto key = combine_checksum_ids(project_hash, username);
    auto segment_itr = idx.find(key);
    
    eosio::check(segment_itr != idx.end(), "Сегмент участника не найден");
    
    idx.modify(segment_itr, _capital, [&](auto &s) {
        s.status = new_status;
    });
}

/**
 * @brief Объединенная функция: обновляет сегмент после принятия результата и пересчитывает доли участника
 * Оптимизированная версия для избежания двойного обновления одной записи
 */
inline void update_segment_after_result_contribution_with_shares(eosio::name coopname, const checksum256 &project_hash, 
                                                               eosio::name username, eosio::name application,
                                                               eosio::asset available_base_after_pay_debt,
                                                               eosio::asset debt_settled_amount = asset(0, _root_govern_symbol)) {
    segments_index segments(_capital, coopname.value);
    auto idx = segments.get_index<"byprojuser"_n>();
    auto key = combine_checksum_ids(project_hash, username);
    auto segment_itr = idx.find(key);
    
    eosio::check(segment_itr != idx.end(), "Сегмент участника не найден");
    
    idx.modify(segment_itr, application, [&](auto &s) {
        // Обновляем после принятия результата
        s.available_base_after_pay_debt = available_base_after_pay_debt;
        s.status = Capital::Segments::Status::CONTRIBUTED;
        
        // Если есть погашение долга, отмечаем его
        if (debt_settled_amount.amount > 0) {
            s.debt_settled += debt_settled_amount;
        }
        
        // Пересчитываем доли участника: базовые_вклады - конвертации - ссуды
        eosio::asset base_contributions = s.creator_base + s.author_base + s.coordinator_base;
        eosio::asset conversions = s.converted_to_wallet + s.converted_to_capital;
        
        s.project_contributor_shares = base_contributions - conversions - s.debt_amount;
        
        // Доли не могут быть отрицательными
        if (s.project_contributor_shares.amount < 0) {
            s.project_contributor_shares = asset(0, _root_govern_symbol);
        }
    });
}

/**
 * @brief Обновляет сегмент участника результатами голосования и премиями
 */
inline void update_segment_voting_results(eosio::name coopname, const checksum256 &project_hash, 
                                         eosio::name username, eosio::name application,
                                         eosio::asset voting_amount,
                                         eosio::asset equal_author_amount,
                                         eosio::asset direct_creator_amount) {
    segments_index segments(_capital, coopname.value);
    auto idx = segments.get_index<"byprojuser"_n>();
    auto key = combine_checksum_ids(project_hash, username);
    auto segment_itr = idx.find(key);
    
    eosio::check(segment_itr != idx.end(), "Сегмент участника не найден");
    
    idx.modify(segment_itr, application, [&](auto &s) {
        s.voting_bonus = voting_amount;
        s.equal_author_bonus = equal_author_amount;
        s.direct_creator_bonus = direct_creator_amount;
    });
    
    // Обновляем общую стоимость сегмента после изменения премий
    update_segment_total_cost(coopname, project_hash, username, application);
}


} // namespace Capital::Segments

