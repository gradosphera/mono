#include "loan.hpp"
#include <ctime>
#include <eosio/transaction.hpp>

#include "src/createdebt.cpp"
#include "src/settledebt.cpp"

using namespace eosio;

[[eosio::action]]
void loan::migrate(){
  require_auth(_loan);
};