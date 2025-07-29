#pragma once

using namespace eosio;
using std::string;

namespace Capital {

/**
  * @brief Структура участника программы капитализации.
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] capitalist {
  name username;                        ///< Имя пользователя
  name coopname;                        ///< Имя кооператива
  asset pending_rewards = asset(0, _root_govern_symbol);  ///< Вознаграждения ожидающие получения
  asset returned_rewards = asset(0, _root_govern_symbol); ///< Полученные вознаграждения
  int64_t reward_per_share_last;        ///< Крайнее вознаграждение за долю

  uint64_t primary_key() const { return username.value; }             ///< Основной ключ.
};

typedef eosio::multi_index<"capitalists"_n, capitalist> capitalist_index; ///< Таблица для хранения участников программы капитализации

inline std::optional<capitalist> get_capitalist(eosio::name coopname, eosio::name username) {
  capitalist_index capitalists(_capital, coopname.value);
  
  auto itr = capitalists.find(username.value);
  if (itr == capitalists.end()) {
      return std::nullopt;
  }

  return *itr;
}

} // namespace Capital