#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;

struct membership_crps {

  double cumulative_reward_per_share = 0.0; ///< Сумма накопленных членских взносов на одну долю
  eosio::asset total_shares = asset(0, _root_govern_symbol);    ///< Общая сумма долей всех участников в проекте (только сконвертированные в кошельки проекта)

  eosio::asset funded = asset(0, _root_govern_symbol);       ///< Общее количество поступивших членских взносов 
  eosio::asset available = asset(0, _root_govern_symbol);    ///< Доступное количество членских взносов для участников проекта согласно долям
  eosio::asset distributed = asset(0, _root_govern_symbol); ///< Распределенное количество членских взносов на участников проекта
  eosio::asset converted_funds = asset(0, _root_govern_symbol); ///< Общая сумма средств, сконвертированных в кошельки проекта

};
