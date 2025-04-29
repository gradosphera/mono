void gateway::outdecline(eosio::name coopname, checksum256 outcome_hash, std::string reason) {
  require_auth(coopname);

  auto exist_outcome = Gateway::get_outcome(coopname, outcome_hash);
  eosio::check(!exist_outcome.has_value(), "Объект возврата уже существует с указанным хэшем");
  Gateway::outcomes_index outcomes(_gateway, coopname.value);

  auto outcome = outcomes.find(exist_outcome -> id);
  
  eosio::check(outcome -> status == "pending"_n, "Только принятые заявления на вывод могут быть обработаны");

  action(
      permission_level{ _gateway, "active"_n},
      outcome -> callback_contract,
      outcome -> decline_callback,
      std::make_tuple(coopname, outcome -> outcome_hash, reason)
  ).send();
  
  outcomes.erase(outcome);
};
