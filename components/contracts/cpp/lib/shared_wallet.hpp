namespace Wallet {
  
  inline void validate_asset(const eosio::asset& amount) {
    check(amount.symbol == _root_govern_symbol, "Invalid token symbol");
    check(amount.is_valid(), "Invalid asset");
    check(amount.amount > 0, "Amount must be positive");
  }
  
  inline void add_available_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type, std::string memo) {
      auto program = get_program_or_fail(coopname, get_program_id(program_type));

      action(
          permission_level{ contract, "active"_n },
          _soviet,
          "addbal"_n,
          std::make_tuple(coopname, username, program.id, amount, memo)
      ).send();

  }
  
  inline void sub_available_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type, std::string memo) {
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "subbal"_n,
        std::make_tuple(coopname, username, program.id, amount, false, memo)
    ).send();
  }

  inline void add_blocked_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type, std::string memo) {
      auto program = get_program_or_fail(coopname, get_program_id(program_type));

      action(
          permission_level{ contract, "active"_n },
          _soviet,
          "addbal"_n,
          std::make_tuple(coopname, username, program.id, amount, memo)
      ).send();

      action(
          permission_level{ contract, "active"_n },
          _soviet,
          "blockbal"_n,
          std::make_tuple(coopname, username, program.id, amount, memo)
      ).send();
  }
  
  inline void sub_blocked_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type, std::string memo) {
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "unblockbal"_n,
        std::make_tuple(coopname, username, program.id, amount, memo)
    ).send();

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "subbal"_n,
        std::make_tuple(coopname, username, program.id, amount, false, memo)
    ).send();
  }
  
  inline void block_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type, std::string memo){
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "blockbal"_n,
        std::make_tuple(coopname, username, program.id, amount, memo)
    ).send();
  }
  
  inline void unblock_funds(eosio::name contract, eosio::name coopname, eosio::name username, eosio::asset amount, eosio::name program_type, std::string memo){
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "unblockbal"_n,
        std::make_tuple(coopname, username, program.id, amount, memo)
    ).send();
  }
  
  inline void pay_membership_fee(name contract, name coopname, name username, name amount, eosio::name program_type, std::string memo) {
    auto program = get_program_or_fail(coopname, get_program_id(program_type));

    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "subbal"_n,
        std::make_tuple(coopname, username, program.id, amount, false, memo)
    ).send();
    
    action(
        permission_level{ contract, "active"_n },
        _soviet,
        "addmemberfee"_n,
        std::make_tuple(coopname, username, program.id, amount, memo)
    ).send();    
    
  }
  
    /**
  * @ingroup public_tables
  * @brief Таблица `deposits` отслеживает депозиты в контракте WALLET.
  */
  struct [[eosio::table, eosio::contract(WALLET)]] deposit {
      uint64_t id; /*!< Уникальный идентификатор записи ввода */
      eosio::name coopname; /*!< Имя аккаунта кооператива, в контексте которого совершается депозит */
      eosio::name username; /*!< Имя аккаунта пользователя, совершившего ввод */
      checksum256 deposit_hash; ///< Хэш входящего платежа
      
      eosio::asset quantity; /*!< Количество средств во внутренней валюте */
      eosio::name status; /*!< Статус ввода */

      eosio::time_point_sec created_at = current_time_point(); ///< Время истечения срока давности
      
      uint64_t primary_key() const { return id; } /*!< Возвращает id как первичный ключ */
      uint64_t by_username() const { return username.value; } /*!< Индекс по имени пользователя */
      checksum256 by_hash() const { return deposit_hash; } /*!< Индекс по хэшу платежа */
      uint64_t by_status() const { return status.value; } /*!< Индекс по статусу вводу */
      uint64_t by_created() const { return created_at.sec_since_epoch(); } 
  };

  typedef eosio::multi_index<
      "deposits"_n, deposit,
      eosio::indexed_by<"byhash"_n, eosio::const_mem_fun<deposit, checksum256, &deposit::by_hash>>,
      eosio::indexed_by<"byusername"_n, eosio::const_mem_fun<deposit, uint64_t, &deposit::by_username>>,
      eosio::indexed_by<"bystatus"_n, eosio::const_mem_fun<deposit, uint64_t, &deposit::by_status>>,
      eosio::indexed_by<"bycreated"_n, eosio::const_mem_fun<deposit, uint64_t, &deposit::by_created>>
  > deposits_index; 

  inline std::optional<deposit> get_deposit(eosio::name coopname, const checksum256 &hash) {
      deposits_index primary_index(_wallet, coopname.value);
      auto secondary_index = primary_index.get_index<"byhash"_n>();

      auto itr = secondary_index.find(hash);
      if (itr == secondary_index.end()) {
          return std::nullopt;
      }

      return *itr;
  }

  /**
  * @ingroup public_tables
  * @brief Таблица `withdraws` отслеживает операции вывода средств в контракте WALLET.
  */
  struct [[eosio::table, eosio::contract(WALLET)]] withdraw {
    uint64_t id; /*!< Уникальный идентификатор записи вывода */
    eosio::name username; /*!< Имя пользователя, осуществляющего вывод средств */
    eosio::name coopname; /*!< Имя аккаунта кооператива, в рамках которого осуществляется вывод */
    checksum256 withdraw_hash; /*!< Идентификатор возврата */
    eosio::name status; /*!< Статус операции вывода */
    
    eosio::asset quantity; /*!< Количество средств для вывода во внутренней валюте */
    document statement; /*!< Заявление на возврат */
    document approved_statement; /*!< Предварительно-принятое заявление */
    document authorization; /*!< Решение совета */
    
    eosio::time_point_sec created_at = current_time_point(); ///< Время истечения срока давности
    
    uint64_t primary_key() const { return id; } /*!< Возвращает id как первичный ключ */
    checksum256 by_hash() const { return withdraw_hash; } ///< Индекс по хэшу задачи.
    uint64_t by_username() const { return username.value; } /*!< Индекс по имени пользователя */
    uint64_t by_status() const { return status.value; } /*!< Индекс по статусу операции вывода */
    uint64_t by_created() const { return created_at.sec_since_epoch(); }
  
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
      withdraws_index primary_index(_wallet, coopname.value);
      auto secondary_index = primary_index.get_index<"byhash"_n>();

      auto itr = secondary_index.find(hash);
      if (itr == secondary_index.end()) {
          return std::nullopt;
      }

      return *itr;
  }


}