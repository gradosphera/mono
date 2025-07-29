void capital::init(eosio::name coopname, eosio::name initiator) {
  check_auth_or_fail(_capital, coopname, initiator, "init"_n);
  
  Capital::global_state_table global_state_inst(_self, _self.value);
  auto itr = global_state_inst.find(0);
  eosio::check(itr == global_state_inst.end(), "Контракт уже инициализирован для кооператива");
  
  //TODO check program_id for exist
  Capital::global_state gs {
    .coopname = coopname,
  };
  
  global_state_inst.emplace(initiator, [&](auto& s) {
    s = gs;
  });
  
}
