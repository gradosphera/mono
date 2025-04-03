[[eosio::action]] void branch::editbranch(eosio::name coopname, eosio::name braname, eosio::name trustee) {
    check_auth_or_fail(_branch, coopname, coopname, "editbranch"_n);

    
    branch_index branches(_branch, coopname.value);
    auto branch = branches.find(braname.value);
    eosio::check(branch != branches.end(), "Кооперативный участок не найден");
      
    auto authorizer_account = get_account_or_fail(trustee);
    eosio::check(authorizer_account.type == "individual"_n, "Только физическое лицо может быть назначено председателем кооперативного участка");

    branches.modify(branch, coopname, [&](auto &b) {
        b.trustee = trustee;
    });
    
}