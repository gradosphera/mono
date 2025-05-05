namespace Registrator {
  
  struct [[eosio::table, eosio::contract(REGISTRATOR)]] candidate {
    eosio::name username; ///< Имя аккаунта пайщика.
    eosio::name coopname;
    eosio::name braname;
    name status; ///< created | payed
    eosio::time_point_sec created_at; ///< Время регистрации аккаунта.
    document2 statement; ///< Заявление на вступление
    checksum256 registration_hash;///< Идентификатор платежа регистрационного взноса
    eosio::asset initial;
    eosio::asset minimum;
    
    uint64_t primary_key() const { return username.value; } 
    checksum256 by_hash() const { return registration_hash; } /*!< Индекс по хэшу платежа */ 
  };

  typedef eosio::multi_index<"candidates"_n, candidate, 
    eosio::indexed_by<"byhash"_n, eosio::const_mem_fun<candidate, checksum256, &candidate::by_hash>>  
  > candidates_index; 


  inline std::optional<candidate> get_candidate_by_hash(eosio::name coopname, const checksum256 &hash) {
    candidates_index primary_index(_registrator, coopname.value);
    auto secondary_index = primary_index.get_index<"byhash"_n>();

    auto itr = secondary_index.find(hash);
    if (itr == secondary_index.end()) {
        return std::nullopt;
    }

    return *itr;
}  
}