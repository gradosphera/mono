#pragma once

using namespace eosio;
using std::string;

namespace Capital::Appendix::Status {
  constexpr eosio::name CREATED = "created"_n;
}

namespace Capital {
/**
  * @brief Структура приложения к договору УХД для конкретного проекта
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] appendix {
    uint64_t id;
    name coopname;
    name username;
    checksum256 project_hash;
    checksum256 appendix_hash;
    name status;
    time_point_sec created_at;
    document2 appendix;
    
    uint64_t primary_key() const { return id; }
    
    uint64_t by_username() const { return username.value; }
    checksum256 by_project() const { return project_hash; }
    checksum256 by_hash() const { return appendix_hash; }
    uint128_t by_project_user() const { return combine_checksum_ids(project_hash, username); }
};

typedef eosio::multi_index<
    "appendixes"_n, appendix,
    indexed_by<"byusername"_n, const_mem_fun<appendix, uint64_t, &appendix::by_username>>,
    indexed_by<"byproject"_n, const_mem_fun<appendix, checksum256, &appendix::by_project>>,
    indexed_by<"byhash"_n, const_mem_fun<appendix, checksum256, &appendix::by_hash>>,
    indexed_by<"byprojuser"_n, const_mem_fun<appendix, uint128_t, &appendix::by_project_user>>
> appendix_index;

}// namespace Capital


namespace Capital::Appendix {
  inline void create_appendix(eosio::name coopname, eosio::name username, checksum256 project_hash, checksum256 appendix_hash, document2 document){
    Capital::appendix_index appendixes(_capital, coopname.value);
    auto appendix_id = get_global_id_in_scope(_capital, coopname, "appendixes"_n);
    
    appendixes.emplace(coopname, [&](auto &a) {
      a.id = appendix_id;
      a.coopname = coopname;
      a.username = username;
      a.project_hash = project_hash;
      a.appendix_hash = appendix_hash;
      a.status = Capital::Appendix::Status::CREATED;
      a.created_at = current_time_point();
      a.appendix = document;
    }); 
  }

  /**
    * @brief Получает приложение по хэшу
    */
    inline  std::optional<appendix> get_appendix(eosio::name coopname, const checksum256 &appendix_hash) {
      appendix_index appendixes(_capital, coopname.value);
      auto by_hash = appendixes.get_index<"byhash"_n>();
      auto itr = by_hash.find(appendix_hash);
      
      if (itr == by_hash.end()) {
          return std::nullopt;
      }
      
      return *itr;
    }
  
    /**
     * @brief Удаляет приложение из таблицы appendixes
     */
    inline void delete_appendix(eosio::name coopname, uint64_t appendix_id){
      // Удаляем запись из таблицы appendixes
      Capital::appendix_index appendixes(_capital, coopname.value);
      auto itr = appendixes.find(appendix_id);
      appendixes.erase(itr);
    }
  
}// namespace Capital::Appendix
