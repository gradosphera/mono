namespace Registrator {
  
  struct [[eosio::table, eosio::contract(REGISTRATOR)]] candidate_legacy {
    eosio::name username; ///< Имя аккаунта пайщика.
    eosio::name coopname;
    eosio::name braname;
    name status; ///< created | payed
    eosio::time_point_sec created_at; ///< Время регистрации аккаунта.
    document statement; ///< Заявление на вступление
    checksum256 registration_hash;///< Идентификатор платежа регистрационного взноса
    eosio::asset initial;
    eosio::asset minimum;
    
    uint64_t primary_key() const { return username.value; } 
    checksum256 by_hash() const { return registration_hash; } /*!< Индекс по хэшу платежа */ 
  };

  typedef eosio::multi_index<"candidates"_n, candidate_legacy, 
    eosio::indexed_by<"byhash"_n, eosio::const_mem_fun<candidate_legacy, checksum256, &candidate_legacy::by_hash>>  
  > candidates_legacy_index; 


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

  typedef eosio::multi_index<"candidates2"_n, candidate, 
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

  /**
   * @brief Получает количество активных пайщиков кооператива
   * @param coopname Имя кооператива
   * @return uint64_t Количество активных пайщиков
   */
  inline uint64_t get_active_participants_count(eosio::name coopname) {
    using namespace eosio;
    
    // Получаем информацию о кооперативе
    cooperatives2_index cooperatives(_registrator, _registrator.value);
    auto coop_itr = cooperatives.find(coopname.value);
    
    if (coop_itr == cooperatives.end() || !coop_itr->is_cooperative || !coop_itr->active_participants_count.has_value()) {
      eosio::check(false, "Счетчик пайщиков кооператива не найден");
    }
    
    return coop_itr->active_participants_count.value();
  }
}