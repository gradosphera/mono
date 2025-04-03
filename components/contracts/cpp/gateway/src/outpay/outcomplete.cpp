void gateway::outcomplete(eosio::name coopname, checksum256 outcome_hash){
  require_auth(coopname);
  
  auto exist_outcome = Gateway::get_outcome(coopname, outcome_hash);
  eosio::check(!exist_outcome.has_value(), "Объект возврата уже существует с указанным хэшем");
  Gateway::outcomes_index outcomes(_gateway, coopname.value);

  auto outcome = outcomes.find(exist_outcome -> id);
  
  eosio::check(outcome -> status == "pending"_n, "Только принятые заявления на вывод могут быть обработаны");

  action(
    permission_level{ _gateway, "active"_n},
    outcome -> callback_contract,
    outcome -> confirm_callback,
    std::make_tuple(coopname, outcome -> outcome_hash)
  ).send();

  outcomes.erase(outcome);  
};
