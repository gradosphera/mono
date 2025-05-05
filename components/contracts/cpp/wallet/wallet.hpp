// capital.hpp

#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include "../lib/common.hpp"

using namespace eosio;
using std::string;

/**
 *  \ingroup public_contracts
 *  @brief  Контракт Wallet управляет взносами и возвратами взносов по ЦПП "Цифровой Кошелёк".
 */
class [[eosio::contract]] wallet : public contract {
public:
    using contract::contract;
    [[eosio::action]] void migrate();
    
    //паевой взнос
    [[eosio::action]] void createdpst(eosio::name coopname, eosio::name username, checksum256 deposit_hash, eosio::asset quantity);
    [[eosio::action]] void completedpst(eosio::name coopname, checksum256 deposit_hash);
    [[eosio::action]] void declinedpst(eosio::name coopname, checksum256 deposit_hash, std::string reason);
 
    //возврат паевого взноса
    [[eosio::action]] void createwthd(eosio::name coopname, eosio::name username, checksum256 withdraw_hash, eosio::asset quantity, document2 statement);
    [[eosio::action]] void completewthd(eosio::name coopname, checksum256 withdraw_hash, std::string memo);
    [[eosio::action]] void declinewthd(eosio::name coopname, checksum256 withdraw_hash, std::string reason);
    [[eosio::action]] void authwthd(eosio::name coopname, checksum256 withdraw_hash);
    [[eosio::action]] void approvewthd(eosio::name coopname, checksum256 withdraw_hash, document2 approved_statement);
    
};