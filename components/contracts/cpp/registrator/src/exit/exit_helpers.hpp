#pragma once

#include <eosio/asset.hpp>
#include <eosio/eosio.hpp>

#include "../../../lib/index.hpp"

/**
 * @brief Вспомогательные функции процедуры выхода пайщика из кооператива.
 *
 * Вынесены в отдельный заголовок (а не в table_registrator_exits.hpp), т.к.
 * опираются на ledger2-кошельки и userwallets, которые подключаются позже в
 * domain/index.hpp. Подключается в registrator.cpp перед exit-экшенами, когда
 * весь lib/index.hpp уже доступен.
 */
namespace Registrator {

using namespace eosio;

/**
 * @brief Доступный L3-баланс пайщика на USER_SHARED-кошельке ledger2.
 *
 * Возвращает available (без blocked) пары `(wallet_name, username)` из таблицы
 * userwallets контракта ledger2. Если записи нет — нулевая сумма в базовой
 * валюте управления.
 */
inline asset get_user_wallet_available(name coopname, name wallet_name, name username) {
  userwallets_index userwallets(_ledger2, coopname.value);
  auto idx = userwallets.get_index<"byuserwallet"_n>();
  auto it = idx.find(combine_ids(wallet_name.value, username.value));
  if (it == idx.end()) {
    return asset(0, _root_govern_symbol);
  }
  return it->available;
}

/**
 * @brief Финализация выхода: удаление пайщика из реестра совета и блокировка
 * аккаунта в registrator.
 *
 * Вызывается по завершении возврата паевого взноса (completexit) либо сразу,
 * если возвращать нечего (нулевой паевой). После этого `get_participant_or_fail`
 * для пайщика начинает падать — он лишён права подавать заявления.
 */
inline void finalize_member_exit(name coopname, name username) {
  // удаляем пайщика из реестра совета (уменьшит счётчик активных пайщиков)
  action(
    permission_level{_registrator, "active"_n},
    _soviet,
    "delpartcpnt"_n,
    std::make_tuple(coopname, username)
  ).send();

  // блокируем аккаунт в картотеке registrator
  accounts_index accounts(_registrator, _registrator.value);
  auto account = accounts.find(username.value);
  eosio::check(account != accounts.end(), "Аккаунт не найден");
  accounts.modify(account, _registrator, [&](auto &a) {
    a.status = "blocked"_n;
  });
}

} // namespace Registrator
