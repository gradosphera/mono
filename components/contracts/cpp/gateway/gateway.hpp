#include <eosio/asset.hpp>
#include <eosio/contract.hpp>
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <eosio/multi_index.hpp>
#include <eosio/system.hpp>
#include <eosio/time.hpp>

#include "../lib/common.hpp"

/**
 *  \ingroup public_contracts
 *
 *  @brief Класс `gateway` обеспечивает процессинг банковских и криптовалютных платежей в кооперативах.
 *  @details
 */
class [[eosio::contract(GATEWAY)]] gateway : public eosio::contract {

public:
  gateway(eosio::name receiver, eosio::name code,
      eosio::datastream<const char *> ds)
      : eosio::contract(receiver, code, ds) {}
  
  void apply(uint64_t receiver, uint64_t code, uint64_t action);
  [[eosio::action]] void migrate();

  //income payments
  [[eosio::action]] void createinpay(eosio::name coopname, eosio::name username, checksum256 income_hash, eosio::asset quantity, eosio::name callback_contract, eosio::name confirm_callback, eosio::name decline_callback);
  [[eosio::action]] void incomplete(eosio::name coopname, checksum256 income_hash);
  [[eosio::action]] void indecline(eosio::name coopname, checksum256 income_hash, std::string reason);
  
  //outcome payments
  [[eosio::action]] void createoutpay(CREATEOUTPAY_SIGNATURE);
  [[eosio::action]] void outcomplete(eosio::name coopname, checksum256 outcome_hash);
  [[eosio::action]] void outdecline(eosio::name coopname, checksum256 outcome_hash, std::string reason);
    
};
