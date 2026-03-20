#pragma once

#include <eosio/eosio.hpp>

#include "../../consts.hpp"

/**
 * Таблицы регистратора — из domain/index.hpp (подключать раньше).
 */
namespace Core::Registrator {

inline account get_account_or_fail(eosio::name username) {
  accounts_index accounts(_registrator, _registrator.value);
  auto account_itr = accounts.find(username.value);
  eosio::check(account_itr != accounts.end(), "Аккаунт не найден");
  return *account_itr;
}

} // namespace Core::Registrator
