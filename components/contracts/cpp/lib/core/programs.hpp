#pragma once

#include <map>
#include <optional>

#include "../consts.hpp"
#include "utils.hpp"

using namespace eosio;

/**
 * Логика программ пайщика и кошелька (совет).
 * Таблицы programs / progwallets / agreements — из domain/index.hpp (подключать раньше).
 */

program get_program_or_fail(eosio::name coopname, uint64_t program_id) {
  programs_index programs(_soviet, coopname.value);
  print("program_id: ", program_id);
  auto program_itr = programs.find(program_id);
  eosio::check(program_itr != programs.end(), "Программа не найдена");

  return program(*program_itr);
}

bool is_participant_of_cpp_by_program_id(eosio::name coopname, eosio::name username, uint64_t program_id) {
  progwallets_index progwallets(_soviet, coopname.value);

  auto wallets_by_username_and_program = progwallets.template get_index<"byuserprog"_n>();
  auto username_and_program_index = combine_ids(username.value, program_id);
  auto wallet = wallets_by_username_and_program.find(username_and_program_index);

  if (wallet == wallets_by_username_and_program.end())
    return false;

  auto program_row = get_program_or_fail(coopname, program_id);

  agreements2_index agreements(_soviet, coopname.value);
  auto agreement_row = agreements.find(wallet->agreement_id);

  if (agreement_row->status == "declined"_n)
    return false;

  return true;
}

bool is_valid_participant_of_program_by_type(eosio::name coopname, eosio::name username,
                                             eosio::name program_type) {
  programs_index programs(_soviet, coopname.value);
  progwallets_index progwallets(_soviet, coopname.value);

  coagreements_index coagreements(_soviet, coopname.value);
  auto coagreement_row = coagreements.find(program_type.value);

  if (coagreement_row == coagreements.end())
    return false;

  auto exist = programs.find(coagreement_row->program_id);

  if (exist == programs.end())
    return false;

  auto wallets_by_username_and_program = progwallets.template get_index<"byuserprog"_n>();
  auto username_and_program_index = combine_ids(username.value, exist->id);
  auto wallet = wallets_by_username_and_program.find(username_and_program_index);

  if (wallet == wallets_by_username_and_program.end())
    return false;

  agreements2_index agreements(_soviet, coopname.value);
  auto agreement_row = agreements.find(wallet->agreement_id);

  if (agreement_row->status == "declined"_n)
    return false;

  return true;
}

struct ProgramInfo {
  uint64_t program_id;
  uint64_t draft_id;
};

static const std::map<eosio::name, ProgramInfo> program_map = {
    {_wallet_program, {1, 1}},
    {_marketplace_program, {2, 699}},
    {_source_program, {3, 0}},
    {_capital_program, {4, 1000}}};

inline void check_valid_program(const eosio::name &type) {
  eosio::check(program_map.find(type) != program_map.end(), "Недопустимый тип программы");
}

inline uint64_t get_program_id(const eosio::name &type) {
  auto it = program_map.find(type);
  eosio::check(it != program_map.end(), "Недопустимый тип программы");
  return it->second.program_id;
}

inline uint64_t get_draft_id(const eosio::name &type) {
  auto it = program_map.find(type);
  eosio::check(it != program_map.end(), "Недопустимый тип программы");
  return it->second.draft_id;
}

std::optional<progwallet> get_program_wallet(eosio::name coopname, eosio::name username, eosio::name type) {
  auto program_id = get_program_id(type);

  progwallets_index progwallets(_soviet, coopname.value);

  auto balances_by_username_and_program = progwallets.template get_index<"byuserprog"_n>();
  auto username_and_program_index = combine_ids(username.value, program_id);
  auto wallet = balances_by_username_and_program.find(username_and_program_index);

  if (wallet == balances_by_username_and_program.end()) {
    return std::nullopt;
  }

  return *wallet;
}
