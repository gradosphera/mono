#pragma once

#include <algorithm>
#include <eosio/eosio.hpp>
#include <vector>

#include "../consts.hpp"

/**
 * @ingroup public_tables
 * @ingroup public_branch_tables
 * @par table: branches
 */
struct [[eosio::table, eosio::contract(BRANCH)]] coobranch {
  eosio::name braname;
  eosio::name trustee;
  std::vector<eosio::name> trusted;

  uint64_t primary_key() const { return braname.value; }
  uint64_t by_trustee() const { return trustee.value; }

  void add_account_to_trusted(const eosio::name &account) { trusted.push_back(account); }

  void remove_account_from_trusted(const eosio::name &account) {
    auto itr = std::remove(trusted.begin(), trusted.end(), account);
    eosio::check(itr != trusted.end(), "Account not found in trusted list");
    trusted.erase(itr, trusted.end());
  }

  bool is_account_in_trusted(const eosio::name &account) const {
    return std::find(trusted.begin(), trusted.end(), account) != trusted.end();
  }

  bool is_user_authorized(const eosio::name &username) const {
    if (trustee == username) {
      return true;
    }
    return is_account_in_trusted(username);
  }
};

typedef eosio::multi_index<
    "branches"_n, coobranch,
    eosio::indexed_by<"bytrustee"_n, eosio::const_mem_fun<coobranch, uint64_t, &coobranch::by_trustee>>>
    branch_index;

coobranch get_branch_or_fail(eosio::name coopname, eosio::name braname) {
  branch_index branches(_branch, coopname.value);
  auto branch = branches.find(braname.value);

  eosio::check(branch != branches.end(), "Кооперативный Участок не найден");

  return *branch;
}
