#include "gateway.hpp"
#include <ctime>
#include <eosio/transaction.hpp>

#include "src/inpay/createinpay.cpp"
#include "src/inpay/incomplete.cpp"
#include "src/inpay/indecline.cpp"

#include "src/outpay/createoutpay.cpp"
#include "src/outpay/outcomplete.cpp"
#include "src/outpay/outdecline.cpp"

using namespace eosio;

/**
 * @brief Миграция контракта процессинга платежей.
 * Выполняет миграцию контракта на новую версию.
 * @ingroup public_actions
 * @ingroup public_gateway_actions

 * @note Авторизация требуется от аккаунта: @p _gateway
 */
[[eosio::action]]
void gateway::migrate(){
  require_auth(_gateway);
};