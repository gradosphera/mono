#include "marketplace.hpp"
#include <eosio/transaction.hpp>
#include "src/accept.cpp"
#include "src/addunits.cpp"
#include "src/authorize.cpp"
#include "src/cancel.cpp"
#include "src/change.cpp"
#include "src/complete.cpp"
#include "src/decline.cpp"
#include "src/delivered.cpp"
#include "src/dispute.cpp"
#include "src/moderate.cpp"
#include "src/offer.cpp"
#include "src/order.cpp"
#include "src/prohibit.cpp"
#include "src/publish.cpp"
#include "src/recieve.cpp"
#include "src/recievecnfrm.cpp"
#include "src/supply.cpp"
#include "src/supplycnfrm.cpp"
#include "src/unpublish.cpp"
#include "src/update.cpp"

/**
 * @brief Пустой метод регистрации нового идентификатора
 * @ingroup public_actions
 * Этот метод используется для возврата информации из контракта.
 * @param id идентификатор
 * @param type тип идентификатора
 */
[[eosio::action]] void marketplace::newid(uint64_t id, eosio::name type) {
  require_auth(_marketplace);
};


[[eosio::action]] void marketplace::migrate(){
  require_auth(_marketplace);
}