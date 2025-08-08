#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;

struct counts_data {
  uint64_t total_authors = 0;                               ///< Общее количество авторов в проекте
  uint64_t total_coordinators = 0;                          ///< Общее количество координаторов в проекте
  uint64_t total_creators = 0;                              ///< Общее количество создателей в проекте
  uint64_t total_investors = 0;                             ///< Общее количество инвесторов в проекте
  uint64_t total_contributors = 0;                          ///< Общее количество зарегистрированных вкладчиков в проекте
  uint64_t total_commits = 0;                               ///< Общее количество коммитов в проекте
};
  