#pragma once

#include <eosio/eosio.hpp>

#include "../consts.hpp"
#include "document_core.hpp"

namespace Marketplace {

using namespace eosio;

struct [[eosio::table, eosio::contract(MARKETPLACE)]] segment {
  uint64_t id;
  uint64_t request_id;
  name type;
  name status;

  document2 convert_in;
  document2 statement;
  uint64_t decision_id;
  document2 authorization;
  document2 act1;
  document2 act2;
  document2 convert_out;

  document2 transport_act_1;
  document2 transport_act_2;
  document2 transport_act_3;
  document2 transport_act_4;

  name coopactor;
  name username;
  name driver_username;
  name receive_from_driver_coopactor;

  time_point_sec created_at;
  time_point_sec updated_at;

  uint64_t primary_key() const { return id; }
  uint64_t by_request() const { return request_id; }
  uint64_t by_type() const { return type.value; }
  uint64_t by_status() const { return status.value; }
};

typedef eosio::multi_index<
    "segments"_n, segment,
    eosio::indexed_by<"byrequest"_n, eosio::const_mem_fun<segment, uint64_t, &segment::by_request>>,
    eosio::indexed_by<"bytype"_n, eosio::const_mem_fun<segment, uint64_t, &segment::by_type>>,
    eosio::indexed_by<"bystatus"_n, eosio::const_mem_fun<segment, uint64_t, &segment::by_status>>>
    segments_index;

} // namespace Marketplace
