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
 *  Контракт `Gateway` выполняет ключевую роль в обработке платежных операций в блокчейн-системе кооперативов. Он позволяет управлять депозитами и выводом средств, обеспечивая эффективное и безопасное взаимодействие между участниками системы.
 *
 *  Для процессинга депозитов контракт предлагает следующие методы:
 *  - `dpcreate`: Создание инвойса для депозита.
 *  - `dpinit`: Инициализация обработки инвойса.
 *  - `dpupdate`: Обновление статуса инвойса.
 *  - `dpcomplete`: Отметка инвойса как исполненного.
 *  - `dpfail`: Отметка инвойса как провалившегося.
 *
 *  Для вывода средств предусмотрены следующие шаги:
 *  - `Transfer`: Перевод на контракт шлюза, который пополняет внутренний баланс.
 *  - `wthdcreate`: Создание поручения на вывод средств и блокировка внутреннего баланса.
 *  - `wthdupdate`: Обновление статуса поручения на вывод.
 *  - `wthdcomplete`: Отметка поручения на вывод как исполненного.
 *  - `wthdfail`: Отметка поручения на вывод как проваленного.
 *
 *  Для возврата средств с внутреннего баланса, полученных путем перевода на аккаунт контракта, применяется метод `back`.
 *
 */
class [[eosio::contract(GATEWAY)]] gateway : public eosio::contract {

public:
  gateway(eosio::name receiver, eosio::name code,
      eosio::datastream<const char *> ds)
      : eosio::contract(receiver, code, ds) {}
  
  [[eosio::action]] void migrate();
  
  [[eosio::action]] void newdepositid(eosio::name username, uint64_t id);
  [[eosio::action]] void newwithdrid(eosio::name username, uint64_t id);
  
  [[eosio::action]] void adduser(eosio::name coopname, eosio::name username, eosio::asset initial, eosio::asset minimum, eosio::time_point_sec created_at, bool spread_initial);

  [[eosio::action]] void newdeposit(eosio::name coopname, eosio::name username, uint64_t deposit_id, eosio::name type, eosio::asset amount, eosio::time_point_sec deposited_at);
  [[eosio::action]] void newwithdraw(eosio::name coopname, eosio::name username, uint64_t withdraw_id, checksum256 withdraw_hash, eosio::name type, eosio::asset amount);

  void apply(uint64_t receiver, uint64_t code, uint64_t action);

  [[eosio::action]] void deposit(eosio::name coopname, eosio::name username, uint64_t deposit_id, eosio::name type, eosio::asset quantity);
  [[eosio::action]] void dpcomplete(eosio::name coopname, eosio::name admin, uint64_t deposit_id, std::string memo);
  [[eosio::action]] void dprefund(eosio::name coopname, eosio::name admin, uint64_t deposit_id, std::string memo);
  
  [[eosio::action]] void withdrawauth(eosio::name coopname, uint64_t withdraw_id);

  [[eosio::action]] void createwthdrw(eosio::name coopname, eosio::name application, eosio::name username, checksum256 withdraw_hash, eosio::asset quantity, document document, name callback_contract, name callback_type, std::string memo);
  [[eosio::action]] void wthdcomplete(eosio::name coopname, eosio::name application, checksum256 withdraw_hash, std::string memo);
  [[eosio::action]] void wthdfail(eosio::name coopname, eosio::name application, uint64_t withdraw_id, std::string memo);
  
  //expense
  [[eosio::action]] void crtwthdrexps(eosio::name coopname, eosio::name application, eosio::name username, checksum256 withdraw_hash, eosio::asset quantity, document document, name callback_contract, name callback_type, std::string memo);
  

  struct [[eosio::table, eosio::contract(GATEWAY)]] counts : counts_base {};


  /**
   * @ingroup public_tables
   * @brief Таблица `balances` отслеживает внутренние балансы пользователей в контракте GATEWAY.
   */
  struct [[eosio::table, eosio::contract(GATEWAY)]] balances : balances_base {};
};
