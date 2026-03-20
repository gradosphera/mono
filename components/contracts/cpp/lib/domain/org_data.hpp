#pragma once

#include <eosio/asset.hpp>
#include <eosio/name.hpp>
#include <string>

/**
 * @ingroup public_tables
 */
struct org_data {
  bool is_cooperative = false;
  eosio::name coop_type;
  std::string announce;
  std::string description;
  eosio::asset initial;
  eosio::asset minimum;

  eosio::asset org_initial;
  eosio::asset org_minimum;
};
