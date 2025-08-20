namespace Approver {
  /**
  \ingroup public_tables
  \ingroup public_soviet_tables
  \brief Таблица утверждений
  *
  * Таблица содержит запросы на утверждение документов и других действий.
  *
  * @note Таблица хранится в области памяти с именем аккаунта: @p _soviet и скоупом: @p coopname
  * @par Имя таблицы (table): approvals
  * @anchor soviet_approval
  */
  struct [[eosio::table, eosio::contract(SOVIET)]] approval {
    uint64_t         id; ///< Уникальный идентификатор утверждения
    eosio::name      coopname; ///< Имя кооператива
    eosio::name      username; ///< Имя пользователя
    eosio::name      type; ///< Тип утверждения
    document2         document; ///< Документ для утверждения
    checksum256      approval_hash; ///< Хэш утверждения
    eosio::name      callback_contract; ///< Контракт для обратного вызова
    eosio::name      callback_action_approve; ///< Действие при одобрении
    eosio::name      callback_action_decline; ///< Действие при отклонении
    std::string      meta; ///< Метаданные
    eosio::time_point_sec created_at; ///< Время создания

    uint64_t primary_key() const { return id; }
    checksum256 by_hash() const { return approval_hash; } ///< Индекс по хэшу утверждения
    uint64_t by_username() const { return username.value; } ///< Индекс по имени пользователя
    uint64_t by_type() const { return type.value; } ///< Индекс по типу утверждения
  };

  typedef eosio::multi_index<
      "approvals"_n, approval,
      eosio::indexed_by<"byhash"_n, eosio::const_mem_fun<approval, checksum256, &approval::by_hash>>,
      eosio::indexed_by<"byusername"_n, eosio::const_mem_fun<approval, uint64_t, &approval::by_username>>,
      eosio::indexed_by<"bytype"_n, eosio::const_mem_fun<approval, uint64_t, &approval::by_type>>
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
