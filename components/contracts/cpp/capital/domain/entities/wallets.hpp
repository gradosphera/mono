namespace Capital {

  /**
   * @brief Кошелек программы капитализации для учёта CRPS и доступных средств от членских взносов
   * @ingroup public_tables
   * @ingroup public_capital_tables
   * 
   * @par Область памяти (scope): coopname
   * @par Имя таблицы (table): capwallets
   */
  struct [[eosio::table, eosio::contract(CAPITAL)]] capital_wallet {
    uint64_t id;                                    ///< ID кошелька (внутренний ключ)
    eosio::name coopname;                           ///< Имя кооператива
    eosio::name username;                           ///< Имя пользователя
    double last_program_crps = 0.0;                  ///< Последнее значение программной CRPS для членских взносов
    eosio::asset capital_available = asset(0, _root_govern_symbol); ///< Доступные средства от членских взносов для вывода
    
    uint64_t primary_key() const { return id; }     ///< Первичный ключ (1)
    uint64_t by_username() const { return username.value; } ///< Индекс по имени пользователя (2)
  };
  
  typedef eosio::multi_index<
    "capwallets"_n, capital_wallet,
    indexed_by<"byusername"_n, const_mem_fun<capital_wallet, uint64_t, &capital_wallet::by_username>>
  > capital_wallets_index;

  /**
   * @brief Таблица кошельков проектов хранит данные о долях участников в проектах для получения членских взносов.
   * @ingroup public_tables
   * @ingroup public_capital_tables

   * @par Область памяти (scope): coopname
   * @par Имя таблицы (table): projwallets 
   */
  struct [[eosio::table, eosio::contract(CAPITAL)]] project_wallet {
    uint64_t id;                                    ///< ID кошелька проекта (внутренний ключ)
    eosio::name coopname;                           ///< Имя кооператива
    checksum256 project_hash;                       ///< Хэш проекта
    eosio::name username;                           ///< Имя пользователя
    eosio::asset shares = asset(0, _root_govern_symbol); ///< Доли участника в проекте для получения членских взносов
    double last_membership_reward_per_share = 0.0;   ///< Последнее значение CRPS для членских взносов
    eosio::asset membership_available = asset(0, _root_govern_symbol); ///< Доступные средства от членских взносов для вывода
    
    uint64_t primary_key() const { return id; }     ///< Первичный ключ (1)
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта (2)
    uint64_t by_username() const { return username.value; } ///< Индекс по имени пользователя (3)
    
    uint128_t by_project_user() const {             ///< Индекс по проекту и пользователю (4)
      return combine_checksum_ids(project_hash, username);
    }
  };
  
  typedef eosio::multi_index<
    "projwallets"_n, project_wallet,
    indexed_by<"byproject"_n, const_mem_fun<project_wallet, checksum256, &project_wallet::by_project_hash>>,
    indexed_by<"byusername"_n, const_mem_fun<project_wallet, uint64_t, &project_wallet::by_username>>,
    indexed_by<"byprojuser"_n, const_mem_fun<project_wallet, uint128_t, &project_wallet::by_project_user>>
  > project_wallets_index;

namespace Wallets {
  
  inline std::optional<progwallet> get_program_capital_wallet(eosio::name coopname, eosio::name username) {
    
    auto program_id = get_program_id(_capital_program);
    
    auto program = get_program_or_fail(coopname, program_id);
    
    auto capital_wallet = get_program_wallet(coopname, username, _capital_program);
    
    if (!capital_wallet.has_value()) {
      return std::nullopt;
    }
    
    return *capital_wallet;
    
  }

  /**
   * @brief Получает кошелек капитализации по имени пользователя
   */
  inline std::optional<capital_wallet> get_capital_wallet_by_username(eosio::name coopname, eosio::name username) {
    capital_wallets_index capital_wallets(_capital, coopname.value);
    auto idx = capital_wallets.get_index<"byusername"_n>();
    
    auto itr = idx.find(username.value);
    if (itr == idx.end()) {
      return std::nullopt;
    }
    
    return *itr;
  }

  /**
   * @brief Получает кошелек капитализации или падает с ошибкой
   */
  inline capital_wallet get_capital_wallet_or_fail(eosio::name coopname, eosio::name username, const char* msg = "Кошелек капитализации не найден") {
    auto wallet_opt = get_capital_wallet_by_username(coopname, username);
    eosio::check(wallet_opt.has_value(), msg);
    return *wallet_opt;
  }
  
  /**
   * @brief Создает или обновляет кошелек капитализации
   */
  inline void upsert_capital_wallet(eosio::name coopname, 
                                   eosio::name username, 
                                   int64_t last_program_crps, 
                                   eosio::asset capital_available) {
    capital_wallets_index capital_wallets(_capital, coopname.value);
    auto idx = capital_wallets.get_index<"byusername"_n>();
    
    auto itr = idx.find(username.value);
    if (itr == idx.end()) {
      // Создаем новый кошелек
      capital_wallets.emplace(coopname, [&](auto &w) {
        w.id = get_global_id_in_scope(_capital, coopname, "capwallets"_n);
        w.coopname = coopname;
        w.username = username;
        w.last_program_crps = last_program_crps;
        w.capital_available = capital_available;
      });
    } else {
      // Обновляем существующий
      idx.modify(itr, coopname, [&](auto &w) {
        if (last_program_crps != 0) w.last_program_crps = last_program_crps;
        if (capital_available.amount != 0) w.capital_available += capital_available;
      });
    }
  }

  /**
   * @brief Получает кошелек проекта по хэшу проекта и имени пользователя
   */
  inline std::optional<project_wallet> get_project_wallet(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    project_wallets_index project_wallets(_capital, coopname.value);
    auto idx = project_wallets.get_index<"byprojuser"_n>();
    auto key = combine_checksum_ids(project_hash, username);
    
    auto itr = idx.find(key);
    if (itr == idx.end()) {
      return std::nullopt;
    }
    
    return *itr;
  }

  /**
   * @brief Получает кошелек проекта или падает с ошибкой
   */
  inline project_wallet get_project_wallet_or_fail(eosio::name coopname, const checksum256 &project_hash, eosio::name username, const char* msg = "Кошелек проекта не найден") {
    auto wallet_opt = get_project_wallet(coopname, project_hash, username);
    eosio::check(wallet_opt.has_value(), msg);
    return *wallet_opt;
  }
  
  /**
   * @brief Создает или обновляет кошелек проекта, добавляя доли к существующим
   */
  inline void upsert_project_wallet(eosio::name coopname, const checksum256 &project_hash, eosio::name username, 
                                   const eosio::asset &shares, eosio::name payer = _capital) {
    project_wallets_index project_wallets(_capital, coopname.value);
    auto idx = project_wallets.get_index<"byprojuser"_n>();
    auto key = combine_checksum_ids(project_hash, username);
    
    auto itr = idx.find(key);
    if (itr == idx.end()) {
      // Создаем новый кошелек
      project_wallets.emplace(payer, [&](auto &w) {
        w.id = get_global_id_in_scope(_capital, coopname, "projwallets"_n);
        w.coopname = coopname;
        w.project_hash = project_hash;
        w.username = username;
        w.shares = shares;
      });
    } else {
      // Добавляем доли к существующим
      idx.modify(itr, payer, [&](auto &w) {
        w.shares += shares;
      });
    }
  }
  
} //namespace Capital::Wallet
} // namespace Capital

