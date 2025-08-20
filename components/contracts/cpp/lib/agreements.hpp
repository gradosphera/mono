/**
\ingroup public_tables
\ingroup public_soviet_tables
\brief Таблица типовых соглашений кооператива
*
* Таблица содержит типовые соглашения кооператива, которые должны подписывать участники.
*
* @note Таблица хранится в области памяти с именем аккаунта: @p _soviet и скоупом: @p coopname
* @par Имя таблицы (table): coagreements
* @anchor soviet_coagreement
*/
struct [[eosio::table, eosio::contract(SOVIET)]] coagreement {
  eosio::name type; ///< Тип соглашения (wallet | user | signature | privacy | ...)
  eosio::name coopname; ///< Имя кооператива
  uint64_t program_id; ///< Идентификатор программы
  uint64_t draft_id; ///< Идентификатор шаблона документа
  
  uint64_t primary_key() const { return type.value;};
    
};

typedef eosio::multi_index<"coagreements"_n, coagreement> coagreements_index;


coagreement get_coagreement_or_fail(eosio::name coopname, eosio::name type) {
  coagreements_index coagreements(_soviet, coopname.value);
  auto coagreement = coagreements.find(type.value);
  eosio::check(coagreement != coagreements.end(), "Соглашение указанного типа не найдено");
  
  return *coagreement;
};


/**
\ingroup public_tables
\ingroup public_soviet_tables
\brief Таблица соглашений (устаревшая версия)
*
* Таблица содержит соглашения, которые подписали участники кооператива.
*
* @note Таблица хранится в области памяти с именем аккаунта: @p _soviet и скоупом: @p coopname
* @par Имя таблицы (table): agreements
* @anchor soviet_agreement
*/
struct [[eosio::table, eosio::contract(SOVIET)]] agreement {
  uint64_t id; ///< Уникальный идентификатор соглашения
  eosio::name coopname; ///< Имя кооператива
  eosio::name username; ///< Имя пользователя
  eosio::name type; ///< Тип принимаемого документа (соответствует действию в контракте)
  uint64_t program_id; ///< Вторичный индекс используется для связи с типовой таблицей
  uint64_t draft_id; ///< Шаблон документа по регистру
  uint64_t version; ///< Версия шаблона (draft), связанного с типовым документом
  document document; ///< Документ соглашения
  eosio::name status; ///< Статус приёма документа 
  eosio::time_point_sec updated_at; ///< Дата-время последнего обновления
  uint64_t primary_key() const { return id; };
  uint64_t by_username() const { return username.value; };
  uint64_t by_status() const {return coopname.value; };
  uint64_t by_draft() const {return draft_id; };  

  /**
   * @brief Возвращает ключ для индекса указанного соглашения пользователя.
   * @return uint128_t - составной ключ, включающий значения имени пользователя и идентификатор шаблона по реестру.
   */
  uint128_t by_user_and_draft() const {
    return combine_ids(username.value, draft_id);
  };

};

typedef eosio::multi_index<"agreements"_n, agreement, 
  eosio::indexed_by<"byusername"_n, eosio::const_mem_fun<agreement, uint64_t, &agreement::by_username>>,
  eosio::indexed_by<"bystatus"_n, eosio::const_mem_fun<agreement, uint64_t, &agreement::by_status>>,
  eosio::indexed_by<"bydraft"_n, eosio::const_mem_fun<agreement, uint64_t, &agreement::by_draft>>,
  eosio::indexed_by<"byuserdraft"_n, eosio::const_mem_fun<agreement, uint128_t, &agreement::by_user_and_draft>>
> agreements_index;


/**
\ingroup public_tables
\ingroup public_soviet_tables
\brief Таблица соглашений (новая версия)
*
* Таблица содержит соглашения, которые подписали участники кооператива.
*
* @note Таблица хранится в области памяти с именем аккаунта: @p _soviet и скоупом: @p coopname
* @par Имя таблицы (table): agreements3
* @anchor soviet_agreement2
*/
struct [[eosio::table, eosio::contract(SOVIET)]] agreement2 {
  uint64_t id; ///< Уникальный идентификатор соглашения
  eosio::name coopname; ///< Имя кооператива
  eosio::name username; ///< Имя пользователя
  eosio::name type; ///< Тип принимаемого документа (соответствует действию в контракте)
  uint64_t program_id; ///< Вторичный индекс используется для связи с типовой таблицей
  uint64_t draft_id; ///< Шаблон документа по регистру
  uint64_t version; ///< Версия шаблона (draft), связанного с типовым документом
  document2 document; ///< Документ соглашения
  eosio::name status; ///< Статус приёма документа 
  eosio::time_point_sec updated_at; ///< Дата-время последнего обновления
  uint64_t primary_key() const { return id; };
  uint64_t by_username() const { return username.value; };
  uint64_t by_status() const {return coopname.value; };
  uint64_t by_draft() const {return draft_id; };  

  /**
   * @brief Возвращает ключ для индекса указанного соглашения пользователя.
   * @return uint128_t - составной ключ, включающий значения имени пользователя и идентификатор шаблона по реестру.
   */
  uint128_t by_user_and_draft() const {
    return combine_ids(username.value, draft_id);
  };

};

typedef eosio::multi_index<"agreements3"_n, agreement2, 
  eosio::indexed_by<"byusername"_n, eosio::const_mem_fun<agreement2, uint64_t, &agreement2::by_username>>,
  eosio::indexed_by<"bystatus"_n, eosio::const_mem_fun<agreement2, uint64_t, &agreement2::by_status>>,
  eosio::indexed_by<"bydraft"_n, eosio::const_mem_fun<agreement2, uint64_t, &agreement2::by_draft>>,
  eosio::indexed_by<"byuserdraft"_n, eosio::const_mem_fun<agreement2, uint128_t, &agreement2::by_user_and_draft>>
> agreements2_index;
