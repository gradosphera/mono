// meet.hpp
#pragma once
#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include "../lib/common.hpp"
#include "include/tables/tables.hpp"
#include "include/structs/structs.hpp"

using namespace eosio;
using std::string;

/**
 *  \ingroup public_contracts
 *  @brief  Контракт Meet управляет собраниями пайщиков.
 */
class [[eosio::contract]] meet : public contract {
public:
    using contract::contract;

    static constexpr uint32_t MIN_OPEN_AGM_DELAY_SEC = 60 * 60 * 24 * 15; // 15 дней

    [[eosio::action]]
    void createmeet(name coopname, checksum256 hash, eosio::name initiator, name presider, name secretary, std::vector<meet_point> agenda, document proposal, time_point_sec open_at, time_point_sec close_at);
    [[eosio::action]]
    void authmeet(eosio::name coopname, checksum256 hash, document authorization);
    [[eosio::action]]
    void declmeet(name coopname, checksum256 hash, std::string reason);

    [[eosio::action]]
    void vote(name coopname, checksum256 hash, name member, std::vector<vote_point> ballot);
    
    [[eosio::action]]
    void restartmeet(name coopname, checksum256 hash, document newproposal, time_point_sec new_open_at, time_point_sec new_close_at);

    [[eosio::action]]
    void signbysecr(name coopname, checksum256 hash, document secretary_decision);
    
    [[eosio::action]]
    void signbypresid(name coopname, checksum256 hash, document presider_decision);
    
    // Сервисное действие:
    [[eosio::action]] void newgdecision(NEWGDECISION_SIGNATURE);
private:
    std::optional<Meet::meet> get_meet(eosio::name coopname, const checksum256 &hash);
};
