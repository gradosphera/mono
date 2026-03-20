#pragma once

#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <vector>

#include "../consts.hpp"
#include "../core/document.hpp"
#include "../core/utils.hpp"
#include "document_core.hpp"

namespace Marketplace {

using namespace eosio;

struct [[eosio::table, eosio::contract(MARKETPLACE)]] shipment {
  uint64_t id;
  checksum256 hash;
  name coopname;
  name driver_username;
  name source_braname;
  name destination_braname;
  name status;

  std::vector<checksum256> request_hashes;

  std::vector<Document::named_document> documents;

  time_point_sec created_at;
  time_point_sec loaded_at;
  time_point_sec delivered_at;
  time_point_sec completed_at;

  uint64_t primary_key() const { return id; }
  checksum256 by_hash() const { return hash; }
  uint64_t by_coop() const { return coopname.value; }
  uint64_t by_driver() const { return driver_username.value; }
  uint64_t by_source() const { return source_braname.value; }
  uint64_t by_destination() const { return destination_braname.value; }
  uint64_t by_status() const { return status.value; }
  uint64_t by_created() const { return created_at.sec_since_epoch(); }
};

typedef eosio::multi_index<
    "shipments"_n, shipment,
    eosio::indexed_by<"byhash"_n, eosio::const_mem_fun<shipment, checksum256, &shipment::by_hash>>,
    eosio::indexed_by<"bycoop"_n, eosio::const_mem_fun<shipment, uint64_t, &shipment::by_coop>>,
    eosio::indexed_by<"bydriver"_n, eosio::const_mem_fun<shipment, uint64_t, &shipment::by_driver>>,
    eosio::indexed_by<"bysource"_n, eosio::const_mem_fun<shipment, uint64_t, &shipment::by_source>>,
    eosio::indexed_by<"bydest"_n, eosio::const_mem_fun<shipment, uint64_t, &shipment::by_destination>>,
    eosio::indexed_by<"bystatus"_n, eosio::const_mem_fun<shipment, uint64_t, &shipment::by_status>>,
    eosio::indexed_by<"bycreated"_n, eosio::const_mem_fun<shipment, uint64_t, &shipment::by_created>>>
    shipments_index;

} // namespace Marketplace
