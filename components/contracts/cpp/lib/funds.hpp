/**
* @brief Структура простого кошелька содержит информацию о доступных и выведенных средствах.
* @ingroup public_tables
* @ingroup public_fund_tables

*/
struct simple_wallet {
  eosio::asset available; ///< Доступные средства
  eosio::asset withdrawed; ///< Выведенные средства
};

/**
* @brief Таблица кооперативного кошелька хранит информацию о различных счетах кооператива.
* @ingroup public_tables
* @ingroup public_fund_tables

* @par Область памяти (scope): coopname
* @par Имя таблицы (table): coopwallet
*/
struct [[eosio::table, eosio::contract(FUND)]] coopwallet {
  uint64_t id = 0;  ///< Только нулевой идентификатор

  eosio::name coopname;  ///< Идентификатор кооператива

  simple_wallet circulating_account;  ///< Паевой счет

  simple_wallet initial_account;  ///< Счет вступительных взносов

  simple_wallet accumulative_account;  ///< Сводный накопительный счет

  simple_wallet accumulative_expense_account;  ///< Накопительный счет списания

  uint64_t primary_key() const { return id; }  ///< Первичный ключ (1)
};

typedef eosio::multi_index<"coopwallet"_n, coopwallet> coopwallet_index;

/**
* @brief Таблица фондов накопления хранит информацию о фондах накопления кооператива.
* @ingroup public_tables
* @ingroup public_fund_tables

* @par Область памяти (scope): coopname
* @par Имя таблицы (table): accfunds
*/
struct [[eosio::table, eosio::contract(FUND)]] accfund {  // фонды накопления
  uint64_t id;  ///< Идентификатор фонда
  eosio::name coopname;  ///< Идентификатор кооператива
  eosio::name
      contract;  ///< Внешний контракт, которому передано управление фондом

  std::string name;         ///< Название фонда
  std::string description;  ///< Описание фонда

  uint64_t percent;  ///< Процент отчислений (1000000 == 100%)
  eosio::asset available;  ///< Количество средств, накопленных в фонде
  eosio::asset withdrawed;  ///< Количество средств, изъятых из фонда накопления

  uint64_t primary_key() const {
    return id;
  }  ///< Первичный ключ (1)
};

typedef eosio::multi_index<"accfunds"_n, accfund> accfunds_index;

/**
* @brief Таблица фондов списания хранит информацию о фондах списания кооператива.
* @ingroup public_tables
* @ingroup public_fund_tables

* @par Область памяти (scope): coopname
* @par Имя таблицы (table): expfunds
*/
struct [[eosio::table, eosio::contract(FUND)]] expfund {  // фонды списания
  uint64_t id;           ///< Идентификатор фонда
  eosio::name coopname;  ///< Идентификатор кооператива
  eosio::name
      contract;  ///< Внешний контракт, которому передано управление фондом

  std::string name;         ///< Название фонда
  std::string description;  ///< Описание фонда

  eosio::asset expended;  ///< Количество средств, списанных по фонду

  uint64_t primary_key() const {
    return id;
  }  ///< Первичный ключ (1)
};

typedef eosio::multi_index<"expfunds"_n, expfund> expfunds_index;

/**
* @brief Таблица запросов на вывод средств из фондов накопления хранит информацию о запросах на использование фондов.
* @ingroup public_tables
* @ingroup public_fund_tables

* @par Область памяти (scope): coopname
* @par Имя таблицы (table): fwithdraws
*/
struct [[eosio::table,
         eosio::contract(
             FUND)]] fwithdraw {  // таблица ожидания решения совета о
                                  // использовании фонда накопления
  uint64_t id; ///< Идентификатор запроса
  eosio::name coopname; ///< Идентификатор кооператива
  eosio::name username; ///< Имя пользователя, запросившего вывод
  eosio::name status; ///< Статус запроса
  eosio::name type; ///< Тип запроса
  uint64_t fund_id; ///< Идентификатор фонда
  eosio::asset quantity; ///< Количество средств для вывода
  document2 document; ///< Документ с обоснованием
  std::string bank_data_id; ///< Идентификатор банковских данных
  eosio::time_point_sec expired_at; ///< Время истечения запроса

  uint64_t primary_key() const {
    return id;
  }  ///< Первичный ключ (1)
  uint64_t by_username() const { return username.value; }  ///< Индекс по имени пользователя (2)
  uint64_t by_status() const { return status.value; }      ///< Индекс по статусу (3)

  uint64_t by_expired() const {
    return expired_at.sec_since_epoch();
  } ///< Индекс по времени истечения (4)
};

typedef eosio::multi_index<
    "fwithdraws"_n, fwithdraw,
    eosio::indexed_by<
        "byusername"_n,
        eosio::const_mem_fun<fwithdraw, uint64_t, &fwithdraw::by_username>>,
    eosio::indexed_by<
        "bystatus"_n,
        eosio::const_mem_fun<fwithdraw, uint64_t, &fwithdraw::by_status>>,
    eosio::indexed_by<
        "byexpired"_n,
        eosio::const_mem_fun<fwithdraw, uint64_t, &fwithdraw::by_expired>>>
    fundwithdraws_index;
