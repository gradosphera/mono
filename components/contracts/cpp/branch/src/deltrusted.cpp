/**
 * @brief Удаление доверенного лица из кооперативного участка.
 * Удаляет доверенное лицо из существующего кооперативного участка.
 * @param coopname Наименование кооператива
 * @param braname Наименование кооперативного участка
 * @param trusted Доверенное лицо для удаления
 * @ingroup public_actions
 * @ingroup public_branch_actions
 * @anchor branch_deltrusted
 * @note Авторизация требуется от аккаунта: @p coopname
 */
[[eosio::action]] void branch::deltrusted(eosio::name coopname, eosio::name braname, eosio::name trusted) {
    check_auth_or_fail(_branch, coopname, coopname, "deltrusted"_n);

    branch_index branches(_branch, coopname.value);
    auto branch = branches.find(braname.value);
    eosio::check(branch != branches.end(), "Кооперативный участок не найден");
    
    branches.modify(branch, coopname, [&](auto &b) {
        auto it = std::find(b.trusted.begin(), b.trusted.end(), trusted);
        eosio::check(it != b.trusted.end(), "Доверенный не найден в кооперативном участке");
        b.trusted.erase(it);
    });
}
