#pragma once

#include <set>
#include <string>

#include <eosio/asset.hpp>
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>

#include "../../consts.hpp"
#include "../actions.hpp"
#include "../names.hpp"

#define CREATEOUTPAY_SIGNATURE                                                                       \
  name coopname, name username, checksum256 outcome_hash, asset quantity, name callback_contract,    \
      name confirm_callback, name decline_callback

using createoutpay_interface = void(CREATEOUTPAY_SIGNATURE);

namespace Gateway {

static const std::set<eosio::name> gateway_income_actions = {
    "deposit"_n,
};

static const std::set<eosio::name> gateway_outcome_actions = {
    "withdraw"_n,
};

inline eosio::name get_valid_income_action(const eosio::name &action) {
  eosio::check(gateway_income_actions.contains(action), "Недопустимое имя действия");
  return action;
}

inline eosio::name get_valid_outcome_action(const eosio::name &action) {
  eosio::check(gateway_outcome_actions.contains(action), "Недопустимое имя действия");
  return action;
}

inline void create_outcome(name calling_contract, CREATEOUTPAY_SIGNATURE) {
  Action::send<createoutpay_interface>(_gateway, Names::External::CREATE_OUTPAY, calling_contract, coopname,
                                       username, outcome_hash, quantity, callback_contract, confirm_callback,
                                       decline_callback);
}

} // namespace Gateway
