/**
 * @brief Миграция данных системы
 * Выполняет миграцию данных системы при обновлении контракта.
 * Вызывается автоматически в CI/CD при каждом деплое.
 * @ingroup public_actions
 * @ingroup public_soviet_actions

 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void soviet::migrate() {
    require_auth(_soviet); // Проверяем авторизацию

    

    // Старый код миграции (закомментирован)
    // cooperatives2_index coops(_registrator, _registrator.value);

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