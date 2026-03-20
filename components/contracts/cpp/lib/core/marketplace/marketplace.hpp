#pragma once

#include <optional>
#include <set>
#include <string>

#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>

#include "../../consts.hpp"
#include "../../domain/document_core.hpp"

#define AUTH_SIGNATURE eosio::name coopname, checksum256 request_hash, document2 authorization

using auth_interface = void(AUTH_SIGNATURE);

namespace Marketplace {

using namespace eosio;

static const std::set<eosio::name> marketplace_callback_actions = {
    "authoffs2c"_n,
    "authoffc2r"_n,
    "authordcont"_n,
    "authordret"_n,
    "declineacc"_n,
};

inline eosio::name get_valid_marketplace_action(const eosio::name &action) {
  eosio::check(marketplace_callback_actions.contains(action), "Недопустимое имя действия marketplace");
  return action;
}

static std::optional<request> get_request_by_hash(eosio::name coopname, checksum256 request_hash) {
  requests_index requests(_marketplace, coopname.value);
  auto idx = requests.get_index<"byhash"_n>();
  auto req = idx.find(request_hash);

  if (req != idx.end()) {
    return *req;
  }
  return std::nullopt;
}

static std::optional<shipment> get_shipment_by_hash(eosio::name coopname, checksum256 shipment_hash) {
  shipments_index shipments(_marketplace, coopname.value);
  auto idx = shipments.get_index<"byhash"_n>();
  auto ship = idx.find(shipment_hash);

  if (ship != idx.end()) {
    return *ship;
  }
  return std::nullopt;
}

static request get_request_by_hash_or_fail(eosio::name coopname, checksum256 request_hash,
                                           const std::string &error_msg = "Заявка не найдена по хэшу") {
  auto request_opt = get_request_by_hash(coopname, request_hash);
  eosio::check(request_opt.has_value(), error_msg);
  return *request_opt;
}

static shipment get_shipment_by_hash_or_fail(eosio::name coopname, checksum256 shipment_hash,
                                             const std::string &error_msg = "Перевозка не найдена по хэшу") {
  auto shipment_opt = get_shipment_by_hash(coopname, shipment_hash);
  eosio::check(shipment_opt.has_value(), error_msg);
  return *shipment_opt;
}

namespace DocumentNames {
static constexpr const name RETURN_STMT = "returnstmt"_n;
static constexpr const name CONVERT_FROM = "convertfrom"_n;
static constexpr const name CONVERT_TO = "convertto"_n;
static constexpr const name CONTRIB_STMT = "contribstmt"_n;
static constexpr const name CONTRIB_AUTH = "contribauth"_n;
static constexpr const name RETURN_AUTH = "returnauth"_n;
static constexpr const name RECEIVE_ACT = "receiveact"_n;
static constexpr const name RECEIVE_ACT_CONF = "receiveconf"_n;
static constexpr const name TRANSPORT1 = "transport1"_n;
static constexpr const name TRANSPORT2 = "transport2"_n;
static constexpr const name TRANSPORT3 = "transport3"_n;
static constexpr const name TRANSPORT4 = "transport4"_n;
static constexpr const name SUPPLY_ACT = "supplyact"_n;
static constexpr const name SUPPLY_ACT_CONF = "supplyconf"_n;
static constexpr const name SHIPMENT_ACT = "shipmentact"_n;
static constexpr const name DELIVERY_ACT = "deliveryact"_n;

static constexpr const name SHIPMENT_SEND_ACT = "shsendact"_n;
static constexpr const name SHIPMENT_LOADING_ACT = "shloadact"_n;
static constexpr const name SHIPMENT_ARRIVE_ACT = "sharriveact"_n;
static constexpr const name SHIPMENT_RECV_ACT = "shrecvact"_n;

static constexpr const name WDISPUTE = "wdispute"_n;
static constexpr const name WRETURN_AUTH = "wreturnauth"_n;
static constexpr const name WSUPPLY_AUTH = "wsupplyauth"_n;
static constexpr const name WRETURN_ACT = "wreturnact"_n;
static constexpr const name WOFFER_ACT = "wofferact"_n;
static constexpr const name WACCEPT_ACT = "wacceptact"_n;
} // namespace DocumentNames

} // namespace Marketplace
