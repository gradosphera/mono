#include "loan.hpp"
#include <ctime>
#include <eosio/transaction.hpp>

#include "src/createdebt.cpp"
#include "src/settledebt.cpp"

using namespace eosio;

/**
 * @brief Миграция данных контракта.
 * @ingroup public_actions
 * @ingroup public_loan_actions
 * @anchor loan_migrate
 * @note Авторизация требуется от аккаунта: @p loan
 */
[[eosio::action]]
void loan::migrate(){
  require_auth(_loan);
};