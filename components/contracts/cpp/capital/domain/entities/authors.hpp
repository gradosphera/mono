#pragma once

using namespace eosio;
using std::string;

namespace Capital {

struct [[eosio::table, eosio::contract(CAPITAL)]] author {
  uint64_t id;
  checksum256 project_hash;
  eosio::name username;
  uint64_t shares;
  
  uint64_t primary_key() const { return id; } ///< Основной ключ
  uint64_t by_username() const { return username.value; } ///< Индекс по имени пользователя
  checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу идеи
  
  uint128_t by_project_author() const {
      return combine_checksum_ids(project_hash, username);
  }
};

typedef eosio::multi_index<"authors"_n, author,
  indexed_by<"byusername"_n, const_mem_fun<author, uint64_t, &author::by_username>>,
  indexed_by<"byprojecthash"_n, const_mem_fun<author, checksum256, &author::by_project_hash>>,
  indexed_by<"byprojauthor"_n, const_mem_fun<author, uint128_t, &author::by_project_author>>
> authors_index;



/**
  * @brief Структура автора, хранящая данные о владельце авторских долей в проекте.  
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] creauthor {
  uint64_t    id;
  checksum256 project_hash;        // С каким результатом связана запись
  checksum256 assignment_hash;        // С каким результатом связана запись
  eosio::name username;           // 
  eosio::asset provisional_amount = asset(0, _root_govern_symbol);
  eosio::asset debt_amount = asset(0, _root_govern_symbol);
  eosio::asset spended = asset(0, _root_govern_symbol);    
  eosio::asset available = asset(0, _root_govern_symbol);
  eosio::asset for_convert = asset(0, _root_govern_symbol);
  
  // Сколько пользователь имеет «авторских долей» в этом результате
  uint64_t author_shares = 0;
  
  // Сколько пользователь имеет «создательских долей» в creators_bonus
  uint64_t creator_bonus_shares = 0;
  
  // Сколько часов вложено в задание
  uint64_t contributed_hours = 0;
  
  uint64_t primary_key() const { return id; }
  
  checksum256 by_assignment_hash() const { return assignment_hash; } ///< Индекс по хэшу задания
  checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта

  // Индекс по (assignment_hash + username)
  uint128_t by_resuser() const {
      return combine_checksum_ids(assignment_hash, username);
  }
};

typedef eosio::multi_index<
  "creauthors"_n, creauthor,
  indexed_by<"byproject"_n, const_mem_fun<creauthor, checksum256, &creauthor::by_project_hash>>,
  indexed_by<"byassignment"_n, const_mem_fun<creauthor, checksum256, &creauthor::by_assignment_hash>>,
  indexed_by<"byresuser"_n, const_mem_fun<creauthor, uint128_t, &creauthor::by_resuser>>
> creauthor_index;


inline std::optional<author> get_author(eosio::name coopname, eosio::name username, const checksum256 &project_hash) {
  authors_index authors(_capital, coopname.value);
  auto project_author_index = authors.get_index<"byprojauthor"_n>();

  uint128_t combined_id = combine_checksum_ids(project_hash, username);
  auto author_itr = project_author_index.find(combined_id);

  if (author_itr == project_author_index.end()) {
      return std::nullopt;
  }

  return *author_itr;
}

inline std::optional<creauthor> get_creauthor(eosio::name coopname, const checksum256 &assignment_hash, eosio::name username) {
  creauthor_index creathors(_capital, coopname.value);
  auto idx  = creathors.get_index<"byresuser"_n>();
  auto rkey = combine_checksum_ids(assignment_hash, username);

  auto it = idx.find(rkey);
  if (it == idx.end()) {
      return std::nullopt;
  }
  return *it;
}

inline creauthor get_creauthor_or_fail(eosio::name coopname, const checksum256 &assignment_hash, eosio::name username, const char* msg) {
  auto maybe_creauthor = get_creauthor(coopname, assignment_hash, username);
  eosio::check(maybe_creauthor.has_value(), msg);
  return *maybe_creauthor;
}

}// namespace Capital
