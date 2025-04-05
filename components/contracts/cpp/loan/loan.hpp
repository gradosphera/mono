#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include "../lib/common.hpp"

/**
 *  \ingroup public_contracts
 *  @brief  Контракт Loan
 */
class [[eosio::contract]] loan : public contract {
public:
    using contract::contract;

    [[eosio::action]] void migrate();

    //создать долг
    [[eosio::action]] void createdebt(CREATEDEBT_SIGNATURE);

    //погасить долг
    [[eosio::action]] void settledebt(SETTLEDEBT_SIGNATURE);
};
