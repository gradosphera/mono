namespace Core::Registrator {
    /**
     * @brief Получает аккаунт по имени пользователя
     * @param username Имя пользователя
     * @return account Найденный аккаунт
     * @throws check если аккаунт не найден
     */
    inline account get_account_or_fail(eosio::name username) {
      accounts_index accounts(_registrator, _registrator.value);
      auto account_itr = accounts.find(username.value);
      eosio::check(account_itr != accounts.end(), "Аккаунт не найден");
      return *account_itr;
    }
} // namespace Core::Registrator

namespace Registrator {
  
  /**
   * @brief Структура кандидата на вступление (устаревшая версия).
   * @ingroup public_tables
   * @ingroup public_registrator_tables

   * @par Область памяти (scope): coopname
   * @par Имя таблицы (table): candidates
   */
  struct [[eosio::table, eosio::contract(REGISTRATOR)]] candidate_legacy {
    eosio::name username; ///< Имя аккаунта пайщика
    eosio::name coopname; ///< Имя кооператива
    eosio::name braname;  ///< Имя филиала
    name status; ///< Статус: created | payed
    eosio::time_point_sec created_at; ///< Время регистрации аккаунта
    document statement; ///< Заявление на вступление
    checksum256 registration_hash; ///< Идентификатор платежа регистрационного взноса
    eosio::asset initial; ///< Начальный взнос
    eosio::asset minimum; ///< Минимальный взнос
    
    uint64_t primary_key() const { return username.value; } 
    checksum256 by_hash() const { return registration_hash; } ///< Индекс по хэшу платежа
  };

  typedef eosio::multi_index<"candidates"_n, candidate_legacy, 
    eosio::indexed_by<"byhash"_n, eosio::const_mem_fun<candidate_legacy, checksum256, &candidate_legacy::by_hash>>  
  > candidates_legacy_index; 


  /**
   * @brief Структура кандидата на вступление.
   * @ingroup public_tables
   * @ingroup public_registrator_tables

   * @par Область памяти (scope): coopname
   * @par Имя таблицы (table): candidates2
   */
  struct [[eosio::table, eosio::contract(REGISTRATOR)]] candidate {
    eosio::name username; ///< Имя аккаунта пайщика
    eosio::name coopname; ///< Имя кооператива
    eosio::name braname;  ///< Имя филиала
    name status; ///< Статус: created | payed
    eosio::time_point_sec created_at; ///< Время регистрации аккаунта
    document2 statement; ///< Заявление на вступление
    checksum256 registration_hash; ///< Идентификатор платежа регистрационного взноса
    eosio::asset initial; ///< Начальный взнос
    eosio::asset minimum; ///< Минимальный взнос
    
    uint64_t primary_key() const { return username.value; } 
    checksum256 by_hash() const { return registration_hash; } ///< Индекс по хэшу платежа
  };

  typedef eosio::multi_index<"candidates2"_n, candidate, 
    eosio::indexed_by<"byhash"_n, eosio::const_mem_fun<candidate, checksum256, &candidate::by_hash>>  
  > candidates_index; 


  /**
   * @brief Получает кандидата по хэшу регистрации.
   * @param coopname Имя кооператива
   * @param hash Хэш регистрации
   * @return Опциональное значение кандидата или nullopt если не найден
   */
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
   * @brief Получает количество активных пайщиков кооператива.
   * @param coopname Имя кооператива
   * @return uint64_t Количество активных пайщиков
   * @throws eosio::check_failure если счетчик пайщиков не найден
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