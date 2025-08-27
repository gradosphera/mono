#include "balances.hpp"

using namespace eosio;
using std::string;

namespace Capital::Core {
  
  /**
   * @brief Функция получения баланса паевых взносов по программе капитализации
   */
   eosio::asset get_capital_program_share_balance(eosio::name coopname) {
    auto capital_program = get_program_or_fail(coopname, _capital_program_id);
    
    return capital_program.available.value() + capital_program.blocked.value();
  }

  /**
   * @brief Функция получения баланса паевых взносов пользователя в программе капитализации
   */
  eosio::asset get_capital_program_user_share_balance(eosio::name coopname, eosio::name username) {
    auto wallet = get_user_program_wallet_or_fail(coopname, username, _capital_program_id);
    
    return wallet.available + wallet.blocked.value();
  }
}