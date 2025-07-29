#pragma once

using namespace eosio;
using std::string;

namespace Capital {

/**
  * @brief Структура создателя, хранящая данные о владельце создательских долей в проекте.
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] creator {
  uint64_t id; ///< id и primary_key
  
  checksum256 project_hash; ///< Хэш идеи
  checksum256 assignment_hash; ///< Хэш задания интеллектуальной деятельности
  
  eosio::name username; ///< Имя пользователя
  eosio::asset spended = asset(0, _root_govern_symbol); ///< Стоимость использованных ресурсов

  uint64_t primary_key() const { return id; }
  checksum256 by_assignment_hash() const { return assignment_hash; }
  checksum256 by_project_hash() const { return project_hash; }
  
  uint128_t by_assignment_creator() const {
        return combine_checksum_ids(assignment_hash, username);
    }
    
  uint64_t by_username() const { return username.value; }
};

typedef eosio::multi_index<"creators"_n, creator,
  indexed_by<"byassignment"_n, const_mem_fun<creator, checksum256, &creator::by_assignment_hash>>,
  indexed_by<"byprojecthash"_n, const_mem_fun<creator, checksum256, &creator::by_project_hash>>,
  indexed_by<"byusername"_n, const_mem_fun<creator, uint64_t, &creator::by_username>>,
  indexed_by<"byassigncrtr"_n, const_mem_fun<creator, uint128_t, &creator::by_assignment_creator>>
> creators_index;


inline std::optional<creator> get_creator(eosio::name coopname, eosio::name username, const checksum256 &assignment_hash) {
  creators_index creators(_capital, coopname.value);
  auto assignment_creator_index = creators.get_index<"byassigncrtr"_n>();

  uint128_t combined_id = combine_checksum_ids(assignment_hash, username);
  auto creator_itr = assignment_creator_index.find(combined_id);

  if (creator_itr == assignment_creator_index.end()) {
      return std::nullopt;
  }

  return *creator_itr;
}


/**
 * @brief Получает количество авторов проекта по его хэшу.
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта.
 * @return Количество авторов, связанных с данным проектом.
 */
 inline uint64_t count_authors_by_project(eosio::name coopname, const checksum256 &project_hash) {
  authors_index authors(_capital, coopname.value);
  auto project_index = authors.get_index<"byprojecthash"_n>();

  auto itr = project_index.lower_bound(project_hash);
  uint64_t count = 0;

  while (itr != project_index.end() && itr->by_project_hash() == project_hash) {
      ++count;
      ++itr;
  }
  return count;
};


}// namespace Capital