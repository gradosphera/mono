#pragma once

using namespace eosio;
using std::string;

namespace Capital {

/**
  * @brief Структура глобального состояния, хранящая общие данные контракта.
  * \ingroup public_tables
  */
  struct [[eosio::table, eosio::contract(CAPITAL)]] global_state {
    eosio::name coopname;                                ///< Имя кооператива глобального состояния.
    uint64_t program_id;                                  ///<  Идентификатор целевой программы.
    
    asset program_membership_funded = asset(0, _root_govern_symbol); ///< Общая сумма членских взносов по программе
    asset program_membership_available = asset(0, _root_govern_symbol); ///< Доступная сумма членских взносов по программе
    asset program_membership_distributed = asset(0, _root_govern_symbol); ///< Распределенная сумма членских взносов по программе
    int64_t program_membership_cumulative_reward_per_share;               ///< Накопительное вознаграждение на долю в членских взносах
    
        
    asset total_shares = asset(0, _root_govern_symbol);    ///< Общая сумма долей всех участников.
    asset total_contributions = asset(0, _root_govern_symbol); ///< Общая сумма всех вкладов.
    asset total_rewards_distributed = asset(0, _root_symbol); ///< Общая сумма распределенных вознаграждений.
    asset total_withdrawed = asset(0, _root_symbol); ///< Общая сумма, выведенная через withdraw1.
    asset total_intellectual_contributions = asset(0, _root_govern_symbol); ///< Общая сумма интеллектуальных вкладов.
    asset total_property_contributions = asset(0, _root_govern_symbol); ///< Общая сумма имущественных вкладов.
    asset accumulated_amount = asset(0, _root_symbol); ///< Накопленные членские взносы.
    int64_t cumulative_reward_per_share = 0;        ///< Накопленное вознаграждение на долю (масштабировано).

    uint64_t primary_key() const { return coopname.value; }     ///< Основной ключ.
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