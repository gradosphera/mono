#include <eosio/action.hpp>
#include <eosio/crypto.hpp>
#include <eosio/permission.hpp>
#include "soviet.hpp"
#include "src/admin.cpp"
#include "src/chairman.cpp"
#include "src/registrator.cpp"
#include "src/voting.cpp"
#include "src/automator.cpp"
#include "src/marketplace.cpp"
#include "src/programs.cpp"
#include "src/contributions.cpp"
#include "src/addresses.cpp"
#include "src/fund.cpp"
#include "src/agreements.cpp"
#include "src/participants.cpp"
#include "src/decisions.cpp"
#include "src/branch.cpp"
#include "src/capital.cpp"
#include "src/openprogwall.cpp"
#include "src/agenda.cpp"

using namespace eosio;

void soviet::migrate() {
    require_auth(_soviet); // Проверяем авторизацию

    // cooperatives_index coops(_registrator, _registrator.value);

    // for (auto coop_it = coops.begin(); coop_it != coops.end(); ++coop_it) {
    //     eosio::name coopname = coop_it->username;

    //     participants_index participants(_soviet, coopname.value);
    //     wallets_index wallets(_soviet, coopname.value);
    //     progwallets_index progwallets(_soviet, coopname.value);
    //     programs_index programs(_soviet, coopname.value);

    //     eosio::asset total_available(0, _root_govern_symbol); // Итоговая сумма available

    //     for (auto part_it = participants.begin(); part_it != participants.end(); ++part_it) {
    //         eosio::name username = part_it->username;

    //         // Получаем кошелек участника из wallets
    //         auto wallet_it = wallets.find(username.value);
    //         if (wallet_it != wallets.end()) {
    //             eosio::asset available_balance = wallet_it->available;
    //             eosio::asset minimum_balance = wallet_it->minimum;
    //             eosio::asset initial_balance = wallet_it->initial.value();

    //             // Обновляем progwallets
    //             auto user_prog_wallets = progwallets.get_index<"byusername"_n>();
    //             auto prog_wallet_it = user_prog_wallets.lower_bound(username.value);

    //             while (prog_wallet_it != user_prog_wallets.end() && prog_wallet_it->username == username) {
    //                 user_prog_wallets.modify(prog_wallet_it, _soviet, [&](auto &w) {
    //                     w.available = available_balance;
    //                 });

    //                 total_available += available_balance; // Добавляем к общей сумме

    //                 ++prog_wallet_it;
    //             }

    //             // Обновляем participant
    //             participants.modify(part_it, _soviet, [&](auto &p) {
    //                 p.minimum_amount = minimum_balance;
    //                 p.initial_amount = initial_balance;
    //             });
    //         }
    //     }

    //     // Обновляем available у программы с id=1
    //     auto program_it = programs.find(1);
    //     if (program_it != programs.end()) {
    //         programs.modify(program_it, _soviet, [&](auto &pr) {
    //             pr.available = total_available;
    //             pr.blocked = asset(0, _root_govern_symbol);
    //             pr.share_contributions = total_available;
    //         });
    //     }
    // }
}



[[eosio::action]] void soviet::init() {
  require_auth(_system);
  
  participants_index participants(_soviet, _provider.value);
    
  participants.emplace(_system, [&](auto &m){
      m.username = _provider_chairman;
      m.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
      m.last_update = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
      m.last_min_pay = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
      m.status = "accepted"_n;
      m.is_initial = true;
      m.is_minimum = true;
      m.has_vote = true;  
      m.type="individual"_n;  
      m.initial_amount = _provider_initial;
      m.minimum_amount = _provider_minimum;
    });

    board_member member {
        .username = _provider_chairman,
        .is_voting = true,
        .position_title = "Председатель",
        .position = "chairman"_n
    };

    std::vector<board_member> members;
    members.push_back(member);    

    boards_index boards(_soviet, _provider.value);
    
    boards.emplace(_system, [&](auto &b) {
      b.id = boards.available_primary_key();
      b.type = "soviet"_n;
      b.members = members;
      b.name = "Совет провайдера";
      b.description = "";
      b.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
      b.last_update = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
    });

    addresses_index addresses(_soviet, _provider.value);
    address_data data;

    addresses.emplace(_system, [&](auto &a) {
      a.id = 0;
      a.coopname = _provider;
      a.data = data;
    });
    
    //создаём базовые кооперативые соглашения
    soviet::make_base_coagreements(_provider, _root_govern_symbol);
    
    //инициализируем фонды
    action(
      permission_level{ _soviet, "active"_n},
      _fund,
      "init"_n,
      std::make_tuple(_provider, _provider_initial)
    ).send();

}

[[eosio::action]] void soviet::newsubmitted(eosio::name coopname, eosio::name username, eosio::name action, uint64_t decision_id, document document) {
  check_auth_and_get_payer_or_fail({_registrator, _soviet});
  
  require_recipient(coopname);
  require_recipient(username);

};

[[eosio::action]] void soviet::newresolved(eosio::name coopname, eosio::name username, eosio::name action, uint64_t decision_id, document document) {
  check_auth_and_get_payer_or_fail({_registrator, _soviet});

  require_recipient(coopname);
  require_recipient(username);

};

[[eosio::action]] void soviet::newdeclined(eosio::name coopname, eosio::name username, document document) {
  check_auth_and_get_payer_or_fail({_registrator, _soviet});

  require_recipient(coopname);
  require_recipient(username);

};


[[eosio::action]] void soviet::declinedoc(eosio::name coopname, eosio::name username, document document) {
  check_auth_or_fail(_soviet, coopname, username, "declinedoc"_n);

  action(
    permission_level{ _soviet, "active"_n},
    _soviet,
    "newdeclined"_n,
    std::make_tuple(coopname, username, document)
  ).send();

};


[[eosio::action]] void soviet::newact(eosio::name coopname, eosio::name username, eosio::name action, uint64_t decision_id, document document) {
  require_auth(_soviet);
  
  require_recipient(coopname);
  require_recipient(username);

};


[[eosio::action]] void soviet::newdecision(eosio::name coopname, eosio::name username, eosio::name action, uint64_t decision_id, document document) {
  require_auth(_soviet);

  require_recipient(coopname);
  require_recipient(username);

};


[[eosio::action]] void soviet::newbatch(eosio::name coopname, eosio::name action, uint64_t batch_id) {
  require_auth(_soviet);

  require_recipient(coopname);
};


[[eosio::action]] void soviet::newprogram(eosio::name coopname, uint64_t program_id) {
  require_auth(_soviet);

  require_recipient(coopname);
};


/**
\ingroup public_actions
\brief Исполнение решения совета
*
* Этот метод позволяет исполнить решение совета. Исполнение решения включает в себя проверку, что решение существует, что оно было авторизовано, и что оно еще не было выполнено. В зависимости от типа решения, вызывается соответствующая функция для его реализации.
*
* @param executer Имя аккаунта, который исполняет решение
* @param coopname Имя кооператива
* @param decision_id Идентификатор решения для исполнения
* 
* @note Авторизация требуется от аккаунта: @p executer
*/
void soviet::exec(eosio::name executer, eosio::name coopname, uint64_t decision_id) { 
  require_auth(executer);
  
  decisions_index decisions(_soviet, coopname.value);
  auto decision = decisions.find(decision_id);
  
  eosio::check(decision != decisions.end(),"Решение не найдено в оперативной памяти");
  eosio::check(decision -> authorized == true, "Только авторизованное решение может быть исполнено");
  
  if (decision -> type == _regaccount_action) {//регистрация аккаунта
    soviet::joincoop_effect(executer, coopname, decision->id, decision->batch_id);
  } else if (decision -> type == _change_action){//операция взноса-возврата взноса в маркетплейсе
    soviet::change_effect(executer, coopname, decision->id, decision->batch_id);
  } else if (decision -> type == _withdraw_action){//операция возврата паевого взноса из кошелька (вывод)
    soviet::withdraw_effect(executer, coopname, decision->id, decision->batch_id);
  } else if (decision -> type == _afund_withdraw_action) {//операция использования фонда накопления
    soviet::subaccum_effect(executer, coopname, decision->id, decision->batch_id);
  } else if (decision -> type == _free_decision_action) {//операция свободного решения
    soviet::freedecision_effect(executer, coopname, decision->id);
  } else if (decision -> type == _capital_contributor_authorize_action) {//операция регистрации контрибьютора (заключение договора УХД)
    soviet::capital_register_contributor_authorize_action_effect(executer, coopname, decision -> id); 
  } else if (decision -> type == _capital_invest_authorize_action) {//операция приёма паевого взноса с кошелька на проект
    soviet::capital_invest_authorize_action_effect(executer, coopname, decision -> id);
  } else {
    soviet::authorize_action_effect(executer, coopname, decision -> id);
  };
}
