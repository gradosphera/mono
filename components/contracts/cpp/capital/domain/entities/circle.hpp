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
    
    // Основная информация о вкладе создателя
    eosio::asset creator_base = asset(0, _root_govern_symbol); //сумма себестоимости, которую создатель фактически потратил на выполнение проекта
    
    // Основная информация о вкладе инвестора
    eosio::asset investor_base = asset(0, _root_govern_symbol); //сумма инвестиций, которую инвестор внес в проект
    
    // Доли в проекте  
    uint64_t author_shares = 0;      // Количество авторских долей (копируется из authors при первом коммите)
    uint64_t creator_shares = 0;     // Количество создательских долей (по creator_base.amount)
    
    // Финансовые данные для ссуд
    eosio::asset provisional_amount = asset(0, _root_govern_symbol); //доступная сумма для залога при получении ссуды
    eosio::asset debt_amount = asset(0, _root_govern_symbol); //сумма, которая уже выдана в ссуду
    eosio::asset available = asset(0, _root_govern_symbol); //сумма, которая доступна для возврата или конвертации
    eosio::asset for_convert = asset(0, _root_govern_symbol); //сумма, которая будет сконвертирована в ЦПП для капитализации
    
    // Координаторские взносы
    eosio::asset coordinator_funds = asset(0, _root_govern_symbol); //средства, привлеченные координатором от новых участников
    
    uint64_t primary_key() const { return id; }
    
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта
  
    // Индекс по (project_hash + username) - уникальный для каждого участника проекта
    uint128_t by_project_user() const {
        return combine_checksum_ids(project_hash, username);
    }
  };
  
  typedef eosio::multi_index<
    "segments"_n, segment,
    indexed_by<"byproject"_n, const_mem_fun<segment, checksum256, &segment::by_project_hash>>,
    indexed_by<"byprojuser"_n, const_mem_fun<segment, uint128_t, &segment::by_project_user>>
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
                                       eosio::name username, const eosio::asset &creator_base) {
    segments_index segments(_capital, coopname.value);
    auto exist_segment = get_segment(coopname, project_hash, username);

    if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = segments.available_primary_key();
            g.project_hash  = project_hash;
            g.username      = username;
            g.creator_base = creator_base;
            g.creator_shares = creator_base.amount;
            // сумма, которая доступна для получения ссуды и используется в качества залога
            g.provisional_amount = creator_base;
        });
    } else {
        auto segment = segments.find(exist_segment->id);
        segments.modify(segment, _capital, [&](auto &g) {
            g.creator_base += creator_base;
            g.provisional_amount += creator_base;
            g.creator_shares += creator_base.amount;
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
            g.investor_base = investor_amount;
        });
    } else {
        auto segment = segments.find(exist_segment->id);
        segments.modify(segment, _capital, [&](auto &g) {
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
            g.author_shares = shares;
        });
    } else {
        auto segment = segments.find(exist_segment->id);
        segments.modify(segment, _capital, [&](auto &g) {
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
            g.coordinator_funds   = rised_amount;
        });
    } else {
        auto segment = segments.find(exist_segment->id);
        segments.modify(segment, _capital, [&](auto &g) {
            g.coordinator_funds += rised_amount;
        });
    }
}

} // namespace Capital::Circle 