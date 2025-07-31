#pragma once

using namespace eosio;
using std::string;

namespace Capital {

struct [[eosio::table, eosio::contract(CAPITAL)]] convert {
  uint64_t id;
  checksum256 project_hash;
  checksum256 convert_hash;
  
  eosio::name coopname;
  eosio::name username;

  eosio::name status = "created"_n; ///< created

  eosio::asset convert_amount = asset(0, _root_govern_symbol);

  document2 convert_statement; ///< Заявление

  time_point_sec created_at = current_time_point();
  
  uint64_t primary_key() const { return id; }     ///< Основной ключ.
  uint64_t by_username() const { return username.value; } ///< Индекс по владельцу
  checksum256 by_convert_hash() const { return convert_hash; } ///< Индекс по хэшу
  checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта
  
  uint128_t by_project_user() const {
      return combine_checksum_ids(project_hash, username);
  }
};

typedef eosio::multi_index<"converts"_n, convert,
  indexed_by<"byusername"_n, const_mem_fun<convert, uint64_t, &convert::by_username>>,
  indexed_by<"byhash"_n, const_mem_fun<convert, checksum256, &convert::by_convert_hash>>,
  indexed_by<"byprojecthash"_n, const_mem_fun<convert, checksum256, &convert::by_project_hash>>,
  indexed_by<"byprojuser"_n, const_mem_fun<convert, uint128_t, &convert::by_project_user>>
> convert_index;


inline std::optional<convert> get_convert(eosio::name coopname, const checksum256 &hash) {
  convert_index converts(_capital, coopname.value);
  auto index = converts.get_index<"byhash"_n>();

  auto itr = index.find(hash);
  
  if (itr == index.end()) {
      return std::nullopt;
  }

  return *itr;
}

}// namespace Capital