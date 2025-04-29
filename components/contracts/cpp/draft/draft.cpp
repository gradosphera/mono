#include "draft.hpp"
#include <ctime>
#include <eosio/transaction.hpp>
#include <eosio/crypto.hpp>

#include "src/createdraft.cpp"
#include "src/createtrans.cpp"
#include "src/deldraft.cpp"
#include "src/deltrans.cpp"
#include "src/editdraft.cpp"
#include "src/edittrans.cpp"
#include "src/upversion.cpp"

using namespace eosio;

[[eosio::action]]
void draft::migrate() {
  require_auth(_draft);
}

void draft::newid(eosio::name scope, uint64_t id) { require_auth(_draft); };


