#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;

namespace Capital::Core {

  /**
   * @brief Получение баланса паевых взносов по программе капитализации
   */
   int64_t get_capital_program_share_balance(eosio::name coopname);

   /**
    * @brief Получение баланса паевых взносов пользователя в программе капитализации
    */
   int64_t get_capital_user_share_balance(eosio::name coopname, eosio::name username);
}