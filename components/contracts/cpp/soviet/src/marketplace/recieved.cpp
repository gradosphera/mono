
// удостоверить акт приёма-передачи от кооператива
// это должно срабатывать на выдаче имущества заказчику для формирования закрывающего списка документов
void soviet::recieved (eosio::name coopname, uint64_t exchange_id) {
  require_auth(_marketplace);

  requests_index exchange(_marketplace, coopname.value);
  auto request = exchange.find(exchange_id);
  eosio::check(request != exchange.end(), "Заявка не обнаружена");
  eosio::check(request -> parent_id > 0, "Только встречная заявка может быть обработана");

  action(
      permission_level{ _soviet, "active"_n},
      _soviet,
      "newdecision"_n,
      std::make_tuple(coopname, request -> money_contributor, _product_return_action, request -> return_product_decision_id, request -> return_product_authorization)
  ).send();

  action(
      permission_level{ _soviet, "active"_n},
      _soviet,
      "newresolved"_n,
      std::make_tuple(coopname, request -> money_contributor, _product_return_action, request -> return_product_decision_id, request -> return_product_statement)
  ).send();
  
  action(
      permission_level{ _soviet, "active"_n},
      _soviet,
      "newact"_n,
      std::make_tuple(coopname, request -> money_contributor, _product_return_action, request -> return_product_decision_id, request -> product_recieve_act_validation)
  ).send();
  
  action(
      permission_level{ _soviet, "active"_n},
      _soviet,
      "newdecision"_n,
      std::make_tuple(coopname, request -> product_contributor, _product_contribution_action, request -> contribution_product_decision_id, request -> contribution_product_authorization)
  ).send();

  action(
      permission_level{ _soviet, "active"_n},
      _soviet,
      "newresolved"_n,
      std::make_tuple(coopname, request -> product_contributor, _product_contribution_action, request -> contribution_product_decision_id, request -> contribute_product_statement)
  ).send();
  
  action(
      permission_level{ _soviet, "active"_n},
      _soviet,
      "newact"_n,
      std::make_tuple(coopname, request -> product_contributor, _product_contribution_action, request -> contribution_product_decision_id, request -> product_contribution_act_validation)
  ).send();

};

