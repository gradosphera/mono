#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include "../lib/common.hpp"

using namespace eosio;
using std::string;

/**
 *  \ingroup public_contracts
 *  @brief  Контракт Loan
 */
class [[eosio::contract]] loan : public contract {
public:
    using contract::contract;
    [[eosio::action]] void migrate();
    
    //создать долг
    [[eosio::action]] void createdebt(name coopname, name username, checksum256 debt_hash, time_point_sec repaid_at, asset quantity);
    
    //погасить долг
    [[eosio::action]] void settledebt(eosio::name coopname, eosio::name username, checksum256 debt_hash, eosio::asset quantity);
    
};