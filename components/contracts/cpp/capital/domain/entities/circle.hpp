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
    
    // Флаги ролей участника в проекте
    bool is_author = false;         // Является ли автором
    bool is_creator = false;        // Является ли создателем  
    bool is_coordinator = false;    // Является ли координатором
    bool is_investor = false;       // Является ли инвестором
    
    // Доли в проекте  
    uint64_t author_shares = 0;      // Количество авторских долей (копируется из authors при первом коммите)
    uint64_t creator_shares = 0;     // Количество создательских долей (по creator_base.amount)
    
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
      
    
    // Финансовые данные для ссуд
    eosio::asset provisional_amount = asset(0, _root_govern_symbol); //доступная сумма для залога при получении ссуды
    eosio::asset debt_amount = asset(0, _root_govern_symbol); //сумма, которая уже выдана в ссуду
    eosio::asset available = asset(0, _root_govern_symbol); //сумма, которая доступна для возврата или конвертации
    eosio::asset for_convert = asset(0, _root_govern_symbol); //сумма, которая будет сконвертирована в ЦПП для капитализации
    
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
  };
  
  typedef eosio::multi_index<
    "segments"_n, segment,
    indexed_by<"byproject"_n, const_mem_fun<segment, checksum256, &segment::by_project_hash>>,
    indexed_by<"byprojuser"_n, const_mem_fun<segment, uint128_t, &segment::by_project_user>>,
    indexed_by<"byprojauth"_n, const_mem_fun<segment, uint128_t, &segment::by_project_author>>,
    indexed_by<"byprojcr"_n, const_mem_fun<segment, uint128_t, &segment::by_project_creator>>,
    indexed_by<"byprojcoord"_n, const_mem_fun<segment, uint128_t, &segment::by_project_coordinator>>,
    indexed_by<"byprojinv"_n, const_mem_fun<segment, uint128_t, &segment::by_project_investor>>
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
 * @brief Создает или обновляет запись генератора для создателя в таблице segments.
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта.
 * @param username Имя пользователя создателя.
 * @param creator_base Себестоимость создателя для данного коммита.
 */
inline void upsert_creator_segment(eosio::name coopname, const checksum256 &project_hash, 
                                       eosio::name username, const pools &delta_pools) {
    segments_index segments(_capital, coopname.value);
    auto exist_segment = get_segment(coopname, project_hash, username);

    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segments.available_primary_key();
            g.project_hash  = project_hash;
            g.username      = username;
            g.is_creator    = true;
            g.creator_base = delta_pools.creators_base_pool;
            g.creator_bonus = delta_pools.creators_bonus_pool;
            g.creator_shares = 1;
            // сумма, которая доступна для получения ссуды и используется в качества залога
            g.provisional_amount = delta_pools.creators_base_pool;
        });
    } else {
        auto segment = segments.find(exist_segment->id);
        segments.modify(segment, _capital, [&](auto &g) {
            g.is_creator = true;
            g.creator_base += delta_pools.creators_base_pool;
            g.creator_bonus += delta_pools.creators_bonus_pool;
            g.provisional_amount += delta_pools.creators_base_pool;
        });
    }
}

/**
 * @brief Создает или обновляет запись генератора для инвестора в таблице segments.
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта.
 * @param username Имя пользователя инвестора.
 * @param investor_amount Сумма инвестиции.
 */
inline void upsert_investor_segment(eosio::name coopname, const checksum256 &project_hash, 
                                      eosio::name username, const eosio::asset &investor_amount) {
    segments_index segments(_capital, coopname.value);
    auto exist_segment = get_segment(coopname, project_hash, username);
        
    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segments.available_primary_key();
            g.project_hash  = project_hash;
            g.username      = username;
            g.is_investor   = true;
            g.investor_base = investor_amount;
        });
    } else {
        auto segment = segments.find(exist_segment->id);
        segments.modify(segment, _capital, [&](auto &g) {
            g.is_investor = true;
            g.investor_base += investor_amount;
        });
    }
}

/**
 * @brief Создает или обновляет запись генератора для автора в таблице segments.
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта.
 * @param username Имя пользователя автора.
 * @param shares Количество авторских долей.
 */
inline void upsert_author_segment(eosio::name coopname, const checksum256 &project_hash, 
                                      eosio::name username, uint64_t shares) {
    segments_index segments(_capital, coopname.value);
    auto exist_segment = get_segment(coopname, project_hash, username);
        
    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segments.available_primary_key();
            g.project_hash  = project_hash;
            g.username      = username;
            g.is_author     = true;
            g.author_shares = shares;
        });
    } else {
        auto segment = segments.find(exist_segment->id);
        segments.modify(segment, _capital, [&](auto &g) {
            g.is_author = true;
            g.author_shares += shares;
        });
    }
}

/**
 * @brief Создает или обновляет запись координатора в таблице segments.
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта.
 * @param coordinator_username Имя пользователя координатора.
 * @param rised_amount Сумма привлеченных средств.
 */
inline void upsert_coordinator_segment(eosio::name coopname, const checksum256 &project_hash, 
                                       eosio::name coordinator_username, const eosio::asset &rised_amount) {
    segments_index segments(_capital, coopname.value);
    auto exist_segment = get_segment(coopname, project_hash, coordinator_username);
        
    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segments.available_primary_key();
            g.project_hash  = project_hash;
            g.username      = coordinator_username;
            g.is_coordinator = true;
            g.coordinator_investments   = rised_amount;
        });
    } else {
        auto segment = segments.find(exist_segment->id);
        segments.modify(segment, _capital, [&](auto &g) {
            g.is_coordinator = true;
            g.coordinator_investments += rised_amount;
        });
    }
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


} // namespace Capital::Circle 