
/**
\ingroup public_tables
\brief Структура таблицы баланса.

@details Структура, представляющая записи баланса в контрактах. Используется при отправке токенов в контракты _marketplace или _registrator.

@note Таблица хранится в области памяти пользователя (_registrator | _marketplace, username)
*/
struct balances_base {
  uint64_t id;          /*!< идентификатор баланса */
  eosio::name contract; /*!< имя контракта токена */
  eosio::asset quantity; /*!< количество токенов на балансе */

  uint64_t primary_key() const { return id; } /*!< return id - primary_key */

  uint128_t byconsym() const {
    return combine_ids(contract.value, quantity.symbol.code().raw());
  } /*!< возвращает уникальный индекс, сформированный из значения contract и символа токена */
};

typedef eosio::multi_index<"balances"_n, balances_base, eosio::indexed_by<"byconsym"_n, eosio::const_mem_fun<balances_base, uint128_t, &balances_base::byconsym>>> balances_index; /*!< Тип мультииндекса для таблицы балансов */


// -----------------------------------------------------------------
// Таблица кошельков
// -----------------------------------------------------------------
struct [[eosio::table, eosio::contract(SOVIET)]] onewallet {
  eosio::name username;
  eosio::name coopname;
  eosio::asset available;
  eosio::asset blocked;
  eosio::asset minimum;
  eosio::binary_extension<eosio::asset> initial;
  
  uint64_t primary_key() const { return username.value; } /*!< return username - primary_key */
};

typedef eosio::multi_index<"wallets"_n, onewallet> wallets_index;



// -----------------------------------------------------------------
// Таблица кошельков конкретных программ
// -----------------------------------------------------------------
struct [[eosio::table, eosio::contract(SOVIET)]] progwallet {
  uint64_t id;
  eosio::name coopname;
  uint64_t program_id;
  uint64_t agreement_id;
  eosio::name username;
  eosio::asset available; ///< доступные средства паевого взноса
  eosio::binary_extension<eosio::asset> blocked; ///< недоступные средства паевого взноса
  eosio::binary_extension<eosio::asset> membership_contribution; ///< внесенный членский взнос
  

  uint64_t primary_key() const { return id; } /*!< return id - primary_key */
  uint64_t by_username() const { return username.value; } /*!< username - secondary_key */
  uint64_t by_program() const { return program_id; } /*!< program_id - secondary_key */
  uint64_t by_agreement() const { return agreement_id; } /*!< agreement_id - secondary_key */

  uint128_t by_username_and_program() const {
    return combine_ids(username.value, program_id);
  } /*!< возвращает уникальный индекс, сформированный из username и program_id */
};

typedef eosio::multi_index<
  "progwallets"_n, 
  progwallet,
  eosio::indexed_by<"byusername"_n, eosio::const_mem_fun<progwallet, uint64_t, &progwallet::by_username>>,
  eosio::indexed_by<"byprogram"_n, eosio::const_mem_fun<progwallet, uint64_t, &progwallet::by_program>>,
  eosio::indexed_by<"byuserprog"_n, eosio::const_mem_fun<progwallet, uint128_t, &progwallet::by_username_and_program>>,
  eosio::indexed_by<"byagreement"_n, eosio::const_mem_fun<progwallet, uint64_t, &progwallet::by_agreement>>
> progwallets_index; /*!< Тип мультииндекса для таблицы кошелька программ */

progwallet get_user_program_wallet_or_fail(eosio::name coopname, eosio::name username, uint64_t program_id) {
  progwallets_index progwallets(_soviet, coopname.value);
  
  auto wallets_by_username_and_program = progwallets.template get_index<"byuserprog"_n>();
  auto username_and_program_index = combine_ids(username.value, program_id);
  auto wallet = wallets_by_username_and_program.find(username_and_program_index);

  eosio::check(wallet != wallets_by_username_and_program.end(), "Кошелёк не найден");
  
  return *wallet;
}
