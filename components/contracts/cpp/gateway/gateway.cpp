#include "gateway.hpp"
#include <ctime>
#include <eosio/transaction.hpp>
#include "src/deposit/deposit.cpp"
#include "src/expense/crtwthdrexps.cpp"

using namespace eosio;

[[eosio::action]]
void gateway::migrate(){
  require_auth(_gateway);
}

[[eosio::action]]
void gateway::newdeposit(eosio::name coopname, eosio::name username, uint64_t deposit_id, eosio::name type, eosio::asset amount, eosio::time_point_sec deposited_at){
  require_auth(_gateway);
}

[[eosio::action]]
void gateway::newwithdraw(eosio::name coopname, eosio::name username, uint64_t withdraw_id, checksum256 withdraw_hash, eosio::name type, eosio::asset amount){
  require_auth(_gateway);
}

/**
 * @brief Пустой метод регистрации нового идентификатора
 * @ingroup public_actions
 * Этот метод используется для возврата информации из контракта.
 * @param id идентификатор
 * @param type тип идентификатора
 */
void gateway::newdepositid(eosio::name username, uint64_t id) {
  require_auth(_gateway);
};

void gateway::newwithdrid(eosio::name username, uint64_t id) {
  require_auth(_gateway);
};

void gateway::adduser(eosio::name coopname, eosio::name username, eosio::asset initial, eosio::asset minimum, eosio::time_point_sec created_at, bool spread_initial) {
  check_auth_and_get_payer_or_fail({_soviet, _gateway});
  
  uint64_t deposit_id = 0; //фактически депозит через контракт не проводился
  
  action(
    permission_level{ _gateway, "active"_n},
    _gateway,
    "newdeposit"_n,
    std::make_tuple(coopname, username, deposit_id, "registration"_n, initial + minimum, created_at)
  ).send();
  
  action(
    permission_level{ _gateway, "active"_n},
    _fund,
    "addcirculate"_n,
    std::make_tuple(coopname, minimum)
  ).send();
  
  if (spread_initial) {
  
    action(
      permission_level{ _gateway, "active"_n},
      _fund,
      "addinitial"_n,
      std::make_tuple(coopname, initial)
    ).send();
    
  }

}

/**
 * @brief Создаёт запрос на вывод средств в контракте `gateway`.
 *
 * @details Действие `wthdcreate` используется для создания запроса на вывод средств, включая внутреннее и внешнее количество токенов и связанную заметку.
 
 * @note Требуется авторизация аккаунта пользователя.
 * @ingroup public_actions
 */
void gateway::createwthdrw(eosio::name coopname, eosio::name application, eosio::name username, checksum256 withdraw_hash, eosio::asset quantity, document document, name callback_contract, name callback_type, std::string memo){
  
  check_auth_or_fail(_branch, coopname, application, "createwthdrw"_n);
  
  Gateway::withdraws_index withdraws(_gateway, coopname.value);
  uint64_t id = get_global_id(_gateway, "withdraws"_n);

  auto cooperative = get_cooperative_or_fail(coopname);
  cooperative.check_symbol_or_fail(quantity);
  
  auto withdraw = Gateway::get_withdraw(coopname, withdraw_hash);
  
  eosio::check(!withdraw.has_value(), "Объект возврата уже существует с указанным хэшем");
  
  eosio::check(quantity.amount > 0, "Сумма вывода должна быть положительной");
  
  withdraws.emplace(coopname, [&](auto &d) {
    d.id = id;
    d.withdraw_hash = withdraw_hash;
    d.callback_contract = callback_contract;
    d.callback_type = callback_type;
    d.username = username;
    d.coopname = coopname;
    d.document = document;
    d.quantity = quantity;
    d.status = "pending"_n;
    d.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
  });

  //здесь необходимо запросить авторизацию совета и заблокировать баланс кошелька
  action(
    permission_level{ _gateway, "active"_n},
    _soviet,
    "withdraw"_n,
    std::make_tuple(coopname, username, id, document)
  ).send();
  
  Wallet::block_funds(_gateway, coopname, username, quantity, _wallet_program);
};


/**
 * Выполняет авторизацию совета для указанного идентификатора вывода.
 *
 * @param coopname - имя кооператива
 * @param withdraw_id - идентификатор вывода
 *
 * @pre Требуется авторизация аккаунта _soviet.
 * @pre Объект процессинга с указанным идентификатором должен существовать.
 * @post Статус объекта процессинга изменяется на "authorized".
 *
 * @throws eosio::check_failure - если объект процессинга не найден.
 */
void gateway::withdrawauth(eosio::name coopname, uint64_t withdraw_id) {

  require_auth(_soviet);

  Gateway::withdraws_index withdraws(_gateway, coopname.value);
  
  auto withdraw = withdraws.find(withdraw_id);
  eosio::check(withdraw != withdraws.end(), "Объект процессинга не найден");
  
  withdraws.modify(withdraw, _soviet, [&](auto &d){
    d.status = "authorized"_n;
  });

}


/**
 * @brief Завершает процесс вывода средств в контракте `gateway`.
 *
 * @details Действие `wthdcomplete` используется для обозначения успешного завершения запроса на вывод средств. Оно обновляет статус запроса на "completed" и обновляет заметку.
 *
 * @note Требуется авторизация аккаунта контракта `gateway`.
 * @ingroup public_actions
 *
 * @param withdraw_id Уникальный идентификатор запроса на вывод средств.
 * @param memo Обновлённая заметка, связанная с запросом на вывод.
 *
 * cleos push action gateway wthdcomplete '["12345", "Успешное завершение"]' -p gateway@active
 */
void gateway::wthdcomplete(eosio::name coopname, eosio::name application, checksum256 withdraw_hash, std::string memo){
  //TODO: надо разделить типы возвратов и вызывать функции для обработки побочных эффектов. 
  // Или убрать отсюда sub_blocked_funds туда где коллбэк
  // туда же надо убрать уменьшение паевого фонда
  // т.к. это относится только к возвратам паевых взносов из кошельков
  // но мы здесь также и расходы платим.
  
  check_auth_or_fail(_gateway, coopname, application, "wthdcomplete"_n);
  
  auto exist = Gateway::get_withdraw(coopname, withdraw_hash);
  check(exist.has_value(), "Объект процессинга не найден");
  
  Gateway::withdraws_index withdraws(_gateway, coopname.value);
  auto withdraw = withdraws.find(exist -> id);
  
  eosio::check(withdraw -> status == "authorized"_n, "Только принятые заявления на вывод могут быть обработаны");

  withdraws.erase(withdraw);
  
  // Wallet::sub_blocked_funds(_gateway, coopname, withdraw -> username, withdraw -> quantity, _wallet_program);

  if (withdraw -> callback_contract != ""_n) {
    // если установлен коллбэк - вызываем его 
    action(
      permission_level{ _gateway, "active"_n},
      withdraw -> callback_contract,
      _withdraw_callback_action,
      std::make_tuple(coopname, withdraw -> callback_type, withdraw -> withdraw_hash)
    ).send();
  };

  // TODO: паевой фонд не всегда должен уменьшаться! 
  // Значит управление уменьшением фонда при списании 
  // с кошелька должно осуществляться не отсюда!
  // Т.е. здесь для обычного возврата из кошелька надо делать 
  // коллбэк в контракт совета чтобы там уменьшить паевой фонд.
  // action(
  //   permission_level{ _gateway, "active"_n},
  //   _fund,
  //   "subcirculate"_n,
  //   std::make_tuple(coopname, withdraw -> quantity, false)
  // ).send();

  //TODO: заменить тип на реальный тип!
  action(
    permission_level{ _gateway, "active"_n},
    _gateway,
    "newwithdraw"_n,
    std::make_tuple(coopname, withdraw -> username, withdraw -> id, withdraw -> withdraw_hash, "type"_n, withdraw -> quantity)
  ).send();

}


/**
 * @brief Отменяет процесс вывода средств в контракте `gateway`.
 *
 * @details Действие `wthdfail` используется для обозначения неудачного завершения запроса на вывод средств. Оно обновляет статус запроса на "failed", обновляет заметку и возвращает средства пользователю.
 *
 * @note Требуется авторизация аккаунта контракта `gateway`.
 * @ingroup public_actions
 *
 * @param withdraw_id Уникальный идентификатор запроса на вывод средств.
 * @param memo Обновлённая заметка, связанная с запросом на вывод.
 *
 * cleos push action gateway wthdfail '["12345", "Отмена из-за ошибки"]' -p gateway@active
 */
void gateway::wthdfail(eosio::name coopname, eosio::name application, uint64_t withdraw_id, std::string memo) {

  check_auth_or_fail(_gateway, coopname, application, "wthdfail"_n);
  

  Gateway::withdraws_index withdraws(_gateway, coopname.value);
  auto withdraw = withdraws.find(withdraw_id);
  eosio::check(withdraw != withdraws.end(), "Объект процессинга не найден");
  eosio::check(withdraw -> status == "pending"_n, "Неверный статус для провала");

  withdraws.modify(withdraw, _gateway, [&](auto &d){
    d.status = "failed"_n;
    d.memo = memo;
  });

  action(
    permission_level{ _gateway, "active"_n},
    _soviet,
    "unblockbal"_n,
    std::make_tuple(coopname, withdraw -> username, _wallet_program_id, withdraw -> quantity)
  ).send();

}
