#include <eosio/asset.hpp>
#include <eosio/contract.hpp>
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <eosio/multi_index.hpp>
#include <eosio/system.hpp>
#include <eosio/time.hpp>

#include "../lib/common.hpp"

/**
\defgroup public_branch Контракт BRANCH
* @anchor public_branch
* Смарт-контракт управления кооперативными участками предназначен для создания, редактирования и удаления кооперативных участков, а также управления доверенными лицами.
*/

/**
\defgroup public_branch_processes Процессы
\ingroup public_branch
*/

/**
\defgroup public_branch_actions Действия
\ingroup public_branch
*/

/**
\defgroup public_branch_tables Таблицы
\ingroup public_branch
*/

// /**
// \defgroup public_branch_consts Константы
// \ingroup public_branch
// */

/**
 * @ingroup public_consts
 * @ingroup public_branch_consts
 * @anchor branch_constants
 * @brief Константы контракта кооперативных участков
 */
// Константы будут добавлены по мере необходимости

/**
 *  \ingroup public_contracts
 *
 *  @brief  Класс `branch` управляет кооперативными участками.
 */
class [[eosio::contract(BRANCH)]] branch : public eosio::contract
{

public:
  branch(eosio::name receiver, eosio::name code,
              eosio::datastream<const char *> ds)
      : eosio::contract(receiver, code, ds) {}

  [[eosio::action]] void init();
  [[eosio::action]] void migrate();
  
  [[eosio::action]] void createbranch(eosio::name coopname, eosio::name braname, eosio::name trustee);
  [[eosio::action]] void editbranch(eosio::name coopname, eosio::name braname, eosio::name trustee);
  [[eosio::action]] void deletebranch(eosio::name coopname, eosio::name braname);
  [[eosio::action]] void addtrusted(eosio::name coopname, eosio::name braname, eosio::name trusted);
  [[eosio::action]] void deltrusted(eosio::name coopname, eosio::name braname, eosio::name trusted);
  
  
};
