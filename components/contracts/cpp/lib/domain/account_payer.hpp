#pragma once

#include <eosio/eosio.hpp>
#include <vector>

bool check_auth_and_get_payer(const std::vector<eosio::name> &payers) {
  for (const auto &payer : payers) {
    if (has_auth(payer)) {
      return true;
    }
  }
  return false;
}

eosio::name check_auth_and_get_payer_or_fail(const std::vector<eosio::name> &payers) {
  for (const auto &payer : payers) {
    if (has_auth(payer)) {
      return payer;
    }
  }
  eosio::check(false, "Недостаточно прав доступа");
  return eosio::name{};
}
