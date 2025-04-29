[[eosio::action]] void fund::authorize(eosio::name coopname, eosio::name type,
                                       uint64_t withdraw_id) {
  require_auth(_soviet);

  fundwithdraws_index fundwithdraws(_fund, coopname.value);
  auto withdraw = fundwithdraws.find(withdraw_id);
  eosio::check(withdraw != fundwithdraws.end(), "Вывод не найден");

  fundwithdraws.modify(withdraw, _soviet,
                       [&](auto &s) { s.status = "authorized"_n; });
};
