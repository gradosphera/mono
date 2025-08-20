#pragma once

using namespace eosio;
using std::string;

namespace Capital {

  /**
   * @brief Конфигурация контракта, управляемая пользователем.
   */
  struct config {
    double coordinator_bonus_percent = 4;   ///< Процент премий координатора от инвестиций (по умолчанию 4%)
    double expense_pool_percent = 100;         ///< Процент инвестиций в пул расходов (по умолчанию 1.0)
    uint32_t coordinator_invite_validity_days = 30; ///< Срок действия приглашения координатора (по умолчанию 30 дней)
    uint32_t voting_period_in_days = 7;        ///< Период голосования в днях (по умолчанию 7)
    double authors_voting_percent = 38.2;      ///< Процент премий авторов для голосования (по умолчанию)
    double creators_voting_percent = 38.2;     ///< Процент премий создателей для голосования (по умолчанию)
  };

  /**
   * @brief Таблица глобального состояния хранит общие данные контракта капитализации.
   * @ingroup public_tables
   * @ingroup public_capital_tables
   * @anchor capital_global_state
   * @par Область памяти (scope): _capital
   * @par Имя таблицы (table): state 
   */
  struct [[eosio::table, eosio::contract(CAPITAL)]] global_state {
    eosio::name coopname;                                ///< Имя кооператива
    asset global_available_invest_pool = asset(0, _root_govern_symbol); ///< Глобальный пул доступных для аллокации инвестиций в программу
    asset program_membership_funded = asset(0, _root_govern_symbol); ///< Общая сумма членских взносов по программе
    asset program_membership_available = asset(0, _root_govern_symbol); ///< Доступная сумма членских взносов по программе
    asset program_membership_distributed = asset(0, _root_govern_symbol); ///< Распределенная сумма членских взносов по программе
    int64_t program_membership_cumulative_reward_per_share;               ///< Накопительное вознаграждение на долю в членских взносах

    config config;                                           ///< Управляемая конфигурация контракта
    
    uint64_t primary_key() const { return coopname.value; }     ///< Первичный ключ (1)
  };

  typedef eosio::multi_index<"state"_n, global_state> global_state_table; ///< Таблица для хранения глобального состояния.

  
  


/**
  * @brief Обновляет глобальное состояние новыми значениями.
  *
  * @param gs Новое глобальное состояние.
  */
inline void update_global_state(const global_state& gs){
  global_state_table global_state_inst(_capital, _capital.value);
  auto itr = global_state_inst.find(gs.coopname.value);
  check(itr != global_state_inst.end(), "Глобальное состояние не найдено");
  global_state_inst.modify(itr, _capital, [&](auto& s) {
      s = gs;
  });
}
    
/**
  * @brief Получает текущее глобальное состояние.
  *
  * @return Текущее глобальное состояние.
  */
inline global_state get_global_state(name coopname) {
    global_state_table global_state_inst(_capital, _capital.value);
    auto itr = global_state_inst.find(coopname.value);
    eosio::check(itr != global_state_inst.end(), "Контракт не инициализирован");
    return *itr;
}

}// namespace Capital