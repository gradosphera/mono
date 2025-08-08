namespace Capital {

  /**
   * @brief Структура кошелька проекта
   */
  struct [[eosio::table, eosio::contract(CAPITAL)]] project_wallet {
    uint64_t id;
    eosio::name coopname;
    checksum256 project_hash;
    eosio::name username;
    eosio::asset shares = asset(0, _root_govern_symbol); ///< доли участника в проекте для получения членских взносов
    int64_t last_membership_reward_per_share = 0; ///< последнее значение CRPS для членских взносов
    eosio::asset membership_available = asset(0, _root_govern_symbol); ///< доступные средства от членских взносов для вывода
    
    uint64_t primary_key() const { return id; }
    checksum256 by_project_hash() const { return project_hash; }
    uint64_t by_username() const { return username.value; }
    
    uint128_t by_project_user() const {
      return combine_checksum_ids(project_hash, username);
    }
  };
  
  typedef eosio::multi_index<
    "projwallets"_n, project_wallet,
    indexed_by<"byproject"_n, const_mem_fun<project_wallet, checksum256, &project_wallet::by_project_hash>>,
    indexed_by<"byusername"_n, const_mem_fun<project_wallet, uint64_t, &project_wallet::by_username>>,
    indexed_by<"byprojuser"_n, const_mem_fun<project_wallet, uint128_t, &project_wallet::by_project_user>>
  > project_wallets_index;

  inline std::optional<progwallet> get_capital_wallet(eosio::name coopname, eosio::name username) {
    
    auto program_id = get_program_id(_capital_program);
    
    auto program = get_program_or_fail(coopname, program_id);
    
    auto capital_wallet = get_program_wallet(coopname, username, _capital_program);
    
    if (!capital_wallet.has_value()) {
      return std::nullopt;
    }
    
    return *capital_wallet;
    
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
  

} // namespace Capital

