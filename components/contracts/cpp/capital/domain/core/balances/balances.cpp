#include "balances.hpp"

using namespace eosio;
using std::string;

namespace Capital::Core {
  
  /**
   * @brief Функция получения баланса паевых взносов по программе капитализации
   */
   eosio::asset get_capital_program_share_balance(eosio::name coopname) {
    auto capital_program = get_capital_program_or_fail(coopname);
    
    return capital_program.available.value() + capital_program.blocked.value();
  }

  /**
   * @brief Функция получения баланса паевых взносов пользователя в программе капитализации
   */
  eosio::asset get_capital_user_share_balance(eosio::name coopname, eosio::name username) {
    auto wallet = Capital::get_capital_wallet(coopname, username);
    eosio::check(wallet.has_value(), "Кошелёк пайщика в программе не найден");

    return wallet -> available + wallet -> blocked.value();
  }
}