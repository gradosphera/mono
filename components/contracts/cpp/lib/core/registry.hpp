#pragma once

#include <eosio/eosio.hpp>

#include "../consts.hpp"

inline eosio::name get_valid_soviet_action(const eosio::name& action) {
    eosio::check(soviet_actions.contains(action), "Недопустимое имя действия");
    return action;
}