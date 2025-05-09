// удостоверить акт приёма-передачи от кооператива
// это должно срабатывать на выдаче имущества заказчику для формирования закрывающего списка документов
void soviet::recieved (eosio::name coopname, uint64_t exchange_id) {
  require_auth(_marketplace);

  requests_index exchange(_marketplace, coopname.value);
  auto request = exchange.find(exchange_id);
  eosio::check(request != exchange.end(), "Заявка не обнаружена");
  eosio::check(request -> parent_id > 0, "Только встречная заявка может быть обработана");

  checksum256 hash = eosio::sha256((char*)&request -> id, sizeof(request -> id));
  
  Action::send<newdecision_interface>(
    _soviet,
    "newdecision"_n,
    _soviet,
    coopname,
    request -> money_contributor,
    _product_return_action,
    hash,
    request -> return_product_authorization
  );

  Action::send<newresolved_interface>(
    _soviet,
    "newresolved"_n,
    _soviet,
    coopname,
    request -> money_contributor,
    _product_return_action,
    hash,
    request -> return_product_statement
  );
  
  Action::send<newact_interface>(
    _soviet,
    "newact"_n,
    _soviet,
    coopname,
    request -> money_contributor,
    _product_return_action,
    hash,
    request -> product_recieve_act_validation
  );
  
  Action::send<newdecision_interface>(
    _soviet,
    "newdecision"_n,
    _soviet,
    coopname,
    request -> product_contributor,
    _product_contribution_action,
    hash,
    request -> contribution_product_authorization
  );

  Action::send<newresolved_interface>(
    _soviet,
    "newresolved"_n,
    _soviet,
    coopname,
    request -> product_contributor,
    _product_contribution_action,
    hash,
    request -> contribute_product_statement
  );
  
  Action::send<newact_interface>(
    _soviet,
    "newact"_n,
    _soviet,
    coopname,
    request -> product_contributor,
    _product_contribution_action,
    hash,
    request -> product_contribution_act_validation
  );

};

