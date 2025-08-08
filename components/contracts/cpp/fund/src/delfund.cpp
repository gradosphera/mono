[[eosio::action]] void fund::delfund(eosio::name coopname, eosio::name username,
                                     eosio::name type, uint64_t fund_id) {
  require_auth(username);

  eosio::check(type == "accumulation"_n || type == "expend"_n,
               "Неверный тип фонда");

  auto cooperative = get_cooperative_or_fail(coopname);

  auto soviet = get_board_by_type_or_fail(coopname, "soviet"_n);
  auto chairman = soviet.get_chairman();
  eosio::check(username == chairman,
               "Только председатель может управлять фондами");

  eosio::check(fund_id > 5, "Нельзя удалить обязательные фонды");

  if (type == "accumulation"_n) {
    accfunds_index accfunds(_fund, coopname.value);
    auto afund = accfunds.find(fund_id);
    eosio::check(afund != accfunds.end(), "Фонд не найден");
    eosio::check(afund->available.amount == 0,
                 "Только пустой фонд накопления может быть удален");

    accfunds.erase(afund);
  } else if (type == "expend"_n) {
    expfunds_index expfunds(_fund, coopname.value);
    auto efund = expfunds.find(fund_id);
    eosio::check(efund != expfunds.end(), "Фонд не найден");

    expfunds.erase(efund);
  }
};
