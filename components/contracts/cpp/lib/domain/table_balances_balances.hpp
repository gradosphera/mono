#pragma once

#include <eosio/asset.hpp>
#include <eosio/eosio.hpp>

#include "../core/utils.hpp"

/**
 * @ingroup public_tables
 * @par table: balances
 */
struct balances_base {
  uint64_t id;
  eosio::name contract;
  eosio::asset quantity;

  uint64_t primary_key() const { return id; }

  uint128_t byconsym() const {
    return combine_ids(contract.value, quantity.symbol.code().raw());
  }
};

typedef eosio::multi_index<
    "balances"_n, balances_base,
    eosio::indexed_by<"byconsym"_n, eosio::const_mem_fun<balances_base, uint128_t, &balances_base::byconsym>>>
    balances_index;
