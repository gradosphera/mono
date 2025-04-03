namespace Gateway {
  inline eosio::name get_valid_income_action(const eosio::name& action) {
    eosio::check(gateway_income_actions.contains(action), "Недопустимое имя действия");
    return action;
  }

  inline eosio::name get_valid_outcome_action(const eosio::name& action) {
    eosio::check(gateway_outcome_actions.contains(action), "Недопустимое имя действия");
    return action;
  }

  /**
  * @ingroup public_tables
  * @brief Таблица `deposits` отслеживает депозиты в контракте GATEWAY.
  */
  struct [[eosio::table, eosio::contract(GATEWAY)]] income {
      uint64_t id; /*!< Уникальный идентификатор записи ввода */
      eosio::name coopname; /*!< Имя аккаунта кооператива, в контексте которого совершается депозит */
      eosio::name username; /*!< Имя аккаунта пользователя, совершившего ввод */
      eosio::name type; /*!< Тип взноса */
      checksum256 income_hash; ///< Хэш входящего платежа
      name callback_contract; ///< контракт для вызова коллбэков
      name confirm_callback; ///< действие успеха
      name decline_callback; ///< действие отклонения
      
      eosio::asset quantity; /*!< Количество средств во внутренней валюте */
      eosio::name status; /*!< Статус ввода */

      eosio::time_point_sec created_at = current_time_point(); ///< Время истечения срока давности

      uint64_t primary_key() const { return id; } /*!< Возвращает id как первичный ключ */
      uint64_t by_username() const { return username.value; } /*!< Индекс по имени пользователя */
      checksum256 by_hash() const { return income_hash; } /*!< Индекс по хэшу платежа */
      uint64_t by_status() const { return status.value; } /*!< Индекс по статусу вводу */
  };

  typedef eosio::multi_index<
      "incomes"_n, income,
      eosio::indexed_by<"byhash"_n, eosio::const_mem_fun<income, checksum256, &income::by_hash>>,
      eosio::indexed_by<"byusername"_n, eosio::const_mem_fun<income, uint64_t, &income::by_username>>,
      eosio::indexed_by<"bystatus"_n, eosio::const_mem_fun<income, uint64_t, &income::by_status>>
  > incomes_index; /*!< Мультииндекс для доступа и манипуляции данными таблицы `incomes` */


  /**
  * @brief Получает возврат из кошелька по хэшу.
  * @param coopname Имя кооператива (scope таблицы).
  * @param hash Хэш возврата.
  * @return `std::optional<income>` - найденное действие или `std::nullopt`, если его нет.
  */
  inline std::optional<income> get_income(eosio::name coopname, const checksum256 &hash) {
      incomes_index primary_index(_gateway, coopname.value);
      auto secondary_index = primary_index.get_index<"byhash"_n>();

      auto itr = secondary_index.find(hash);
      if (itr == secondary_index.end()) {
          return std::nullopt;
      }

      return *itr;
  }
  
  
  /**
  * @ingroup public_tables
  * @brief Таблица `deposits` отслеживает депозиты в контракте GATEWAY.
  */
  struct [[eosio::table, eosio::contract(GATEWAY)]] outcome {
      uint64_t id; /*!< Уникальный идентификатор записи ввода */
      eosio::name coopname; /*!< Имя аккаунта кооператива, в контексте которого совершается депозит */
      eosio::name username; /*!< Имя аккаунта пользователя, совершившего ввод */
      eosio::name type; /*!< Тип взноса */
      checksum256 outcome_hash; ///< Хэш входящего платежа
      name callback_contract; ///< контракт для вызова коллбэков
      name confirm_callback; ///< действие успеха
      name decline_callback; ///< действие отклонения
      
      eosio::asset quantity; /*!< Количество средств во внутренней валюте */
      eosio::name status; /*!< Статус ввода */

      eosio::time_point_sec created_at = current_time_point(); ///< Время истечения срока давности

      uint64_t primary_key() const { return id; } /*!< Возвращает id как первичный ключ */
      uint64_t by_username() const { return username.value; } /*!< Индекс по имени пользователя */
      checksum256 by_hash() const { return outcome_hash; } /*!< Индекс по хэшу платежа */
      uint64_t by_status() const { return status.value; } /*!< Индекс по статусу вводу */
  };

  typedef eosio::multi_index<
      "outcomes"_n, outcome,
      eosio::indexed_by<"byhash"_n, eosio::const_mem_fun<outcome, checksum256, &outcome::by_hash>>,
      eosio::indexed_by<"byusername"_n, eosio::const_mem_fun<outcome, uint64_t, &outcome::by_username>>,
      eosio::indexed_by<"bystatus"_n, eosio::const_mem_fun<outcome, uint64_t, &outcome::by_status>>
  > outcomes_index; /*!< Мультииндекс для доступа и манипуляции данными таблицы `outcome` */


  inline std::optional<outcome> get_outcome(eosio::name coopname, const checksum256 &hash) {
      outcomes_index primary_index(_gateway, coopname.value);
      auto secondary_index = primary_index.get_index<"byhash"_n>();

      auto itr = secondary_index.find(hash);
      if (itr == secondary_index.end()) {
          return std::nullopt;
      }

      return *itr;
  }
}
