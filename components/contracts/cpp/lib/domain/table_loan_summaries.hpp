#pragma once

#include <eosio/asset.hpp>
#include <eosio/eosio.hpp>

#include "../consts.hpp"

namespace Loan {

using namespace eosio;

struct [[eosio::table, eosio::contract(LOAN)]] summary {
  name username;
  asset total;

  uint64_t primary_key() const { return username.value; }
};

typedef multi_index<"summaries"_n, summary> summaries_index;

} // namespace Loan
