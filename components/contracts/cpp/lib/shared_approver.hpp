namespace Approver {
  struct [[eosio::table, eosio::contract(SOVIET)]] approval {
    uint64_t         id;
    eosio::name      coopname;
    eosio::name      username;
    document         document;
    checksum256      approval_hash;
    eosio::name      callback_contract; 
    eosio::name      callback_action_approve;  
    eosio::name      callback_action_decline;  
    std::string      meta;
    eosio::time_point_sec created_at;

    uint64_t primary_key() const { return id; }
    checksum256 by_hash() const { return approval_hash; } /*!< Индекс по хэшу платежа */
    uint64_t by_username() const { return username.value; }      
  };

  typedef eosio::multi_index<
      "approvals"_n, approval,
      eosio::indexed_by<"byhash"_n, eosio::const_mem_fun<approval, checksum256, &approval::by_hash>>,
      eosio::indexed_by<"byusername"_n, eosio::const_mem_fun<approval, uint64_t, &approval::by_username>>
  > approvals_index; /*!< Мультииндекс для доступа и манипуляции данными таблицы `approvals` */


  inline std::optional<approval> get_approval(eosio::name coopname, const checksum256 &hash) {
      approvals_index primary_index(_soviet, coopname.value);
      auto secondary_index = primary_index.get_index<"byhash"_n>();

      auto itr = secondary_index.find(hash);
      if (itr == secondary_index.end()) {
          return std::nullopt;
      }

      return *itr;
  }
  
}
