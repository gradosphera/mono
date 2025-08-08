void capital::capdeclwthd3(name coopname, checksum256 withdraw_hash, std::string reason) {
  require_auth(_soviet);

  auto exist_withdraw = Capital::get_program_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект возврата не найден");
  
  Capital::program_withdraws_index program_withdraws(_capital, coopname.value);
  auto withdraw = program_withdraws.find(exist_withdraw->id);
  
  eosio::check(withdraw != program_withdraws.end(), "Объект возврата не найден");

  // Возвращаем средства обратно в capital_available contributor
  auto contributor_opt = Capital::Contributors::get_contributor(coopname, withdraw->username);
  if (contributor_opt.has_value()) {
    Capital::contributor_index contributors(_capital, coopname.value);
    auto contributor_it = contributors.get_index<"byusername"_n>();
    auto contributor = contributor_it.find(withdraw->username.value);
    
    if (contributor != contributor_it.end()) {
      contributor_it.modify(contributor, _capital, [&](auto &c) {
        c.capital_available += withdraw->amount;
      });
      
      // Обновляем глобальное состояние - возвращаем средства
      auto state = Capital::get_global_state(coopname);
      state.program_membership_distributed -= withdraw->amount;
      state.program_membership_available += withdraw->amount;
      update_global_state(state);
    }
  }

  // Удаляем заявку
  program_withdraws.erase(withdraw);
}