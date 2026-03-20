#pragma once

#include <eosio/eosio.hpp>
#include <string>

/**
 * @ingroup public_tables
 */
struct verification {
  eosio::name verificator;
  bool is_verified;
  eosio::name procedure;
  eosio::time_point_sec created_at;
  eosio::time_point_sec last_update;
  std::string notice;
};
