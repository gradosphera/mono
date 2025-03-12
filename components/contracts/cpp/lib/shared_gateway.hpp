namespace Gateway {

  /**
  * @ingroup public_tables
  * @brief Таблица `withdraws` отслеживает операции вывода средств в контракте GATEWAY.
  */
  struct [[eosio::table, eosio::contract(GATEWAY)]] withdraw {
    uint64_t id; /*!< Уникальный идентификатор записи вывода */
    eosio::name username; /*!< Имя пользователя, осуществляющего вывод средств */
    eosio::name coopname; /*!< Имя аккаунта кооператива, в рамках которого осуществляется вывод */
    checksum256 withdraw_hash; /*!< Идентификатор возврата */
    eosio::name callback_contract;    ///< Контракт коллбэка
    eosio::name callback_type;        ///< Тип коллбэка
    eosio::name status; /*!< Статус операции вывода */
    
    eosio::asset quantity; /*!< Количество средств для вывода во внутренней валюте */
    document document; /*!< Заявление на возврат */
    std::string memo; /*!< Примечание к операции вывода */
    eosio::time_point_sec created_at; ///< Время истечения срока давности

    uint64_t primary_key() const { return id; } /*!< Возвращает id как первичный ключ */
    checksum256 by_hash() const { return withdraw_hash; } ///< Индекс по хэшу задачи.
    uint64_t by_username() const { return username.value; } /*!< Индекс по имени пользователя */
    uint64_t by_status() const { return status.value; } /*!< Индекс по статусу операции вывода */
    uint64_t by_created() const { return created_at.sec_since_epoch(); } /*!< Индекс по статусу истечения */    
  
};

  typedef eosio::multi_index<
    "withdraws"_n, withdraw,
    eosio::indexed_by<"byusername"_n, eosio::const_mem_fun<withdraw, uint64_t, &withdraw::by_username>>,
    eosio::indexed_by<"byhash"_n, const_mem_fun<withdraw, checksum256, &withdraw::by_hash>>,
    eosio::indexed_by<"bystatus"_n, eosio::const_mem_fun<withdraw, uint64_t, &withdraw::by_status>>,
    eosio::indexed_by<"bycreated"_n, eosio::const_mem_fun<withdraw, uint64_t, &withdraw::by_created>>
    > withdraws_index; /*!< Мультииндекс для доступа и манипуляции данными таблицы `withdraws` */


  /**
  * @brief Получает возврат из кошелька по хэшу.
  * @param coopname Имя кооператива (scope таблицы).
  * @param hash Хэш возврата.
  * @return `std::optional<withdraw>` - найденное действие или `std::nullopt`, если его нет.
  */
  inline std::optional<withdraw> get_withdraw(eosio::name coopname, const checksum256 &hash) {
      withdraws_index primary_index(_gateway, coopname.value);
      auto secondary_index = primary_index.get_index<"byhash"_n>();

      auto itr = secondary_index.find(hash);
      if (itr == secondary_index.end()) {
          return std::nullopt;
      }

      return *itr;
  }


}
