#pragma once

#include <eosio/eosio.hpp>

#include "../../consts.hpp"

/**
 * Чтение таблиц branch / branchstat (domain/index.hpp — раньше).
 */
namespace Branch {

uint64_t get_branch_count(eosio::name coopname) {
  branchstat_index stat(_branch, _branch.value);
  auto st = stat.find(coopname.value);

  if (st == stat.end()) {
    return 0;
  }

  return st->count;
}

bool is_trustee(eosio::name coopname, eosio::name username) {
  branch_index branches(_branch, coopname.value);

  auto by_trustee_index = branches.get_index<"bytrustee"_n>();
  auto trustee_itr = by_trustee_index.find(username.value);

  return trustee_itr != by_trustee_index.end();
}

bool is_trusted(eosio::name coopname, eosio::name braname, eosio::name username) {
  branch_index branches(_branch, coopname.value);
  auto branch_itr = branches.find(braname.value);

  if (branch_itr == branches.end()) {
    return false;
  }

  return branch_itr->is_account_in_trusted(username);
}

} // namespace Branch
