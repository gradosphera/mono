#pragma once

#include <eosio/eosio.hpp>

#include "../consts.hpp"
#include "table_registrator_accounts.hpp"

account get_account_or_fail(eosio::name username) {
  accounts_index accounts(_registrator, _registrator.value);
  auto account_row = accounts.find(username.value);
  eosio::check(account_row != accounts.end(), "Аккаунт не найден");

  return *account_row;
}
