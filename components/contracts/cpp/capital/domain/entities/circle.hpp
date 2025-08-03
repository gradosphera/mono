#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;

namespace Capital::Circle {

/**
  * @brief Структура сегмента, хранящая данные о вкладах участника в проект.  
  */
  struct [[eosio::table, eosio::contract(CAPITAL)]] segment {
    uint64_t    id;
    checksum256 project_hash;        // С каким проектом связан сегмент
    eosio::name username;           // Имя участника
    
    // Доли в проекте (если > 0, то участник выполняет эту роль)  
    uint64_t author_shares = 0;      // Количество авторских долей (копируется из authors при первом коммите)
    uint64_t creator_shares = 0;     // Количество создательских долей (по creator_base.amount)
    uint64_t coordinator_shares = 0; // Количество координаторских долей (по coordinator_investments.amount)
    uint64_t investor_shares = 0;    // Количество инвесторских долей
    uint64_t contributor_shares = 0; // Количество вкладчических долей (по балансу в программе капитализации)
    
    // Флаг голосования
    bool has_vote = false; // true если сегмент принадлежит создателю или автору (имеет право голоса)
    
    // CRPS поля для масштабируемого распределения наград
    int64_t last_author_base_reward_per_share = 0;         // Последняя зафиксированная базовая награда на долю для авторов  
    int64_t last_author_bonus_reward_per_share = 0;        // Последняя зафиксированная бонусная награда на долю для авторов
    int64_t last_coordinator_reward_per_share = 0;         // Последняя зафиксированная награда на долю для координаторов
    int64_t last_contributor_reward_per_share = 0;         // Последняя зафиксированная награда на долю для вкладчиков
    
    // Основная информация о вкладе инвестора
    eosio::asset investor_base = asset(0, _root_govern_symbol); //сумма инвестиций, которую инвестор внес в проект
    
    
    // Основная информация о вкладе создателя
    eosio::asset creator_base = asset(0, _root_govern_symbol); //сумма себестоимости, которую создатель фактически потратил на выполнение проекта
    eosio::asset creator_bonus = asset(0, _root_govern_symbol); //сумма бонусов, которую создатель получил за выполнение проекта
    
    // Основная информация о вкладе автора
    eosio::asset author_base = asset(0, _root_govern_symbol); //сумма себестоимости, которую автор фактически потратил на выполнение проекта
    eosio::asset author_bonus = asset(0, _root_govern_symbol); //сумма бонусов, которую автор получил за выполнение проекта
    
    // Основная информация о вкладе координатора
    eosio::asset coordinator_investments = asset(0, _root_govern_symbol); //сумма инвестиций, которую координатор привлек в проект
    eosio::asset coordinator_base = asset(0, _root_govern_symbol); //сумма себестоимости, которую координатор фактически потратил на выполнение проекта
    eosio::asset coordinator_bonus = asset(0, _root_govern_symbol); //сумма бонусов координатора - не используем
    
    // Основная информация о вкладе вкладчика
    eosio::asset contributor_bonus = asset(0, _root_govern_symbol); //сумма бонусов, которую вкладчик получил от проекта
      
    
    // Финансовые данные для ссуд
    eosio::asset provisional_amount = asset(0, _root_govern_symbol); //доступная сумма для залога при получении ссуды
    eosio::asset debt_amount = asset(0, _root_govern_symbol); //сумма, которая уже выдана в ссуду
    eosio::asset available = asset(0, _root_govern_symbol); //сумма, которая доступна для возврата или конвертации
    eosio::asset for_convert = asset(0, _root_govern_symbol); //сумма, которая будет сконвертирована в ЦПП для капитализации
    
    // Пулы равных премий авторов и прямых премий создателей
    eosio::asset equal_author_bonus = asset(0, _root_govern_symbol); //сумма равных премий авторам
    eosio::asset direct_creator_bonus = asset(0, _root_govern_symbol); //сумма прямых премий создателю
    
    // Результаты голосования по методу Водянова
    eosio::asset voting_bonus = asset(0, _root_govern_symbol);  //сумма от голосования авторского пула
    
    
    uint64_t primary_key() const { return id; }
    
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта
  
    // Индекс по (project_hash + username) - уникальный для каждого участника проекта
    uint128_t by_project_user() const {
        return combine_checksum_ids(project_hash, username);
    }
    
    // Индекс для поиска авторов в проекте
    uint128_t by_project_author() const {
        if (author_shares == 0) return 0;
        return combine_checksum_ids(project_hash, eosio::name{"isauthor"});
    }
    
    // Индекс для поиска создателей в проекте
    uint128_t by_project_creator() const {
        if (creator_shares == 0) return 0;
        return combine_checksum_ids(project_hash, eosio::name{"iscreator"});
    }
    
    // Индекс для поиска координаторов в проекте
    uint128_t by_project_coordinator() const {
        if (coordinator_shares == 0) return 0;
        return combine_checksum_ids(project_hash, eosio::name{"iscoord"});
    }
    
    // Индекс для поиска инвесторов в проекте  
    uint128_t by_project_investor() const {
        if (investor_shares == 0) return 0;
        return combine_checksum_ids(project_hash, eosio::name{"isinvestor"});
    }
    
    // Индекс для поиска вкладчиков в проекте  
    uint128_t by_project_contributor() const {
        if (contributor_shares == 0) return 0;
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
        if (itr->author_shares > 0) {
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
        if (itr->creator_shares > 0) {
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
        if (itr->coordinator_shares > 0) {
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
        if (itr->investor_shares > 0) {
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
        if (itr->author_shares > 0) {
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
    return segment.has_value() && segment->has_vote;
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
}


} // namespace Capital::Circle 