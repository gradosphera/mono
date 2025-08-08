void capital::setconfig(eosio::name coopname, eosio::name initiator, Capital::config cfg) {
  check_auth_or_fail(_capital, coopname, initiator, "setconfig"_n);

  Capital::global_state_table global_state_inst(_self, _self.value);
  auto itr = global_state_inst.find(coopname.value);

  if (itr == global_state_inst.end()) {
    global_state_inst.emplace(initiator, [&](auto& s) {
      s.coopname = coopname;
      s.config = cfg;
    });
  } else {
    global_state_inst.modify(itr, initiator, [&](auto& s) {
      s.config = cfg;
    });
  }
}


