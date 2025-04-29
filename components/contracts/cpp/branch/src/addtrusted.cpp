[[eosio::action]] void branch::addtrusted(eosio::name coopname, eosio::name braname, eosio::name trusted) {
    check_auth_or_fail(_branch, coopname, coopname, "addtrusted"_n);

    branch_index branches(_branch, coopname.value);
    auto branch = branches.find(braname.value);
    eosio::check(branch != branches.end(), "Кооперативный участок не найден");
    
    auto trusted_account = get_account_or_fail(trusted);
    eosio::check(trusted_account.type == "individual"_n, "Только физическое лицо может быть назначено доверенным кооперативного участка");

    branches.modify(branch, coopname, [&](auto &b) {
        eosio::check(std::find(b.trusted.begin(), b.trusted.end(), trusted) == b.trusted.end(), 
            "Доверенный уже добавлен в кооперативный участок");
        eosio::check(b.trusted.size() < 3, "Не больше трех доверенных на одном кооперативном участке");
        b.trusted.push_back(trusted);
    });
}
