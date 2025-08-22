#pragma once

using namespace eosio;
using std::string;

namespace Capital::ProgramInvests {
  /**
   * @brief Константы статусов программных инвестиций
   * @ingroup public_consts
   * @ingroup public_capital_consts

   */
   namespace Status {
    const eosio::name CREATED = "created"_n;     ///< Программная инвестиция создана
  }
}

namespace Capital {

  /**
   * @brief Таблица программных инвестиций хранит данные об инвестициях в программу капитализации.
   * @ingroup public_tables
   * @ingroup public_capital_tables

   * @par Область памяти (scope): coopname
   * @par Имя таблицы (table): progrinvests 
   */
  struct [[eosio::table, eosio::contract(CAPITAL)]] program_invest {
    uint64_t id;                                ///< ID программной инвестиции (внутренний ключ)
    eosio::name coopname;                       ///< Имя кооператива
    eosio::name username;                       ///< Имя инвестора
    checksum256 invest_hash;                    ///< Хэш инвестиции
    eosio::name status;                         ///< Статус инвестиции
    time_point_sec invested_at;                 ///< Время создания инвестиции
    document2 statement;                        ///< Заявление на инвестицию
    eosio::asset amount;                        ///< Сумма инвестиции
    
    uint64_t primary_key() const { return id; } ///< Первичный ключ (1)
    uint64_t by_username() const { return username.value; } ///< Индекс по имени пользователя (2)
    checksum256 by_hash() const { return invest_hash; } ///< Индекс по хэшу инвестиции (3)
  };

typedef eosio::multi_index<
    "progrinvests"_n, program_invest,
    indexed_by<"byusername"_n, const_mem_fun<program_invest, uint64_t, &program_invest::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<program_invest, checksum256, &program_invest::by_hash>>
> program_invest_index;

namespace ProgramInvests {
    
    /**
     * @brief Получает программную инвестицию по хэшу.
     * @param coopname Имя кооператива (scope таблицы).
     * @param invest_hash Хэш инвестиции.
     * @return Опциональная программная инвестиция.
     */
    inline std::optional<program_invest> get_program_invest(eosio::name coopname, const checksum256& invest_hash) {
        program_invest_index program_invests(_capital, coopname.value);
        auto invest_hash_index = program_invests.get_index<"byhash"_n>();
        auto itr = invest_hash_index.find(invest_hash);
        
        if (itr != invest_hash_index.end()) {
            return *itr;
        }
        
        return std::nullopt;
    }

    /**
     * @brief Получает программную инвестицию по хэшу или завершает выполнение с ошибкой.
     * @param coopname Имя кооператива (scope таблицы).
     * @param invest_hash Хэш инвестиции.
     * @return Программная инвестиция.
     */
    inline program_invest get_program_invest_or_fail(eosio::name coopname, const checksum256& invest_hash) {
        auto invest = get_program_invest(coopname, invest_hash);
        eosio::check(invest.has_value(), "Программная инвестиция с указанным хэшем не найдена");
        return *invest;
    }

    /**
     * @brief Создает программную инвестицию и отправляет её на утверждение.
     * @param coopname Имя кооператива.
     * @param username Имя пользователя инвестора.
     * @param invest_hash Хэш инвестиции.
     * @param amount Сумма инвестиции.
     * @param statement Заявление на инвестицию.
     */
    inline void create_program_invest_with_approve(
        eosio::name coopname,
        eosio::name username,
        checksum256 invest_hash,
        eosio::asset amount,
        document2 statement
    ) {
        // Создаем программную инвестицию
        program_invest_index program_invests(_capital, coopname.value);
        uint64_t invest_id = get_global_id_in_scope(_capital, coopname, "progrinvests"_n);
        
        program_invests.emplace(coopname, [&](auto &i){
            i.id = invest_id;
            i.coopname = coopname;
            i.username = username;
            i.invest_hash = invest_hash;
            i.status = Capital::ProgramInvests::Status::CREATED;
            i.invested_at = current_time_point();
            i.statement = statement;
            i.amount = amount;
        });
        
        // Отправляем на approve председателю
        ::Soviet::create_approval(
            _capital,
            coopname,
            username,
            statement,
            Names::Capital::CREATE_PROGRAM_INVESTMENT,
            invest_hash,
            _capital,
            Names::Capital::APPROVE_PROGRAM_INVESTMENT,
            Names::Capital::DECLINE_PROGRAM_INVESTMENT,
            std::string("")
        );
    }

    /**
     * @brief Удаляет программную инвестицию после обработки.
     * @param coopname Имя кооператива.
     * @param invest_hash Хэш инвестиции.
     */
    inline void remove_program_invest(eosio::name coopname, const checksum256& invest_hash) {
        program_invest_index program_invests(_capital, coopname.value);
        auto invest_hash_index = program_invests.get_index<"byhash"_n>();
        auto itr = invest_hash_index.find(invest_hash);
        
        eosio::check(itr != invest_hash_index.end(), "Программная инвестиция для удаления не найдена");
        invest_hash_index.erase(itr);
    }

} // namespace ProgramInvests

} // namespace Capital