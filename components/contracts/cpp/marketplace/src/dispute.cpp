[[eosio::action]] void marketplace::dispute(eosio::name coopname, eosio::name username, uint64_t exchange_id, document document){

  require_auth(coopname);
    
  requests_index exchange(_marketplace, coopname.value);
  auto change = exchange.find(exchange_id);
  
  eosio::check(change -> type == "order"_n, "Спор может быть открыт только по заявке на поставку");
  
  eosio::check(change != exchange.end(), "Заявка не найдена");
  eosio::check(change -> username == username, "Только заказчик может открыть спор");
  
  eosio::check(change -> is_warranty_return == false, "Нельзя открыть спор на спор");

  auto parent_change = exchange.find(change -> parent_id);
  eosio::check(parent_change != exchange.end(), "Родительская заявка не найдена");

  eosio::check(change -> status == "recieved2"_n, "Неверный статус для открытия спора");
  
  exchange.modify(change, _marketplace, [&](auto &e){
    e.status = "disputed"_n;
    e.disputed_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
    e.warranty_return_id = change -> id;
  });

  uint64_t new_id = get_global_id(_marketplace, "exchange"_n);
  uint64_t new_parent_id = get_global_id(_marketplace, "exchange"_n);  

  auto cooperative = get_cooperative_or_fail(coopname);
  
  // Проверяем подпись документа
  verify_document_or_fail(document);
  
  //открытая заявка от заказчика на поставку имущества поставщику
  exchange.emplace(_marketplace, [&](auto &i) {
    i.id = new_parent_id;
    i.type = "offer"_n;
    i.program_id = change -> program_id; 
    i.username = username;
    i.parent_username = ""_n;
    i.parent_id = 0;
    i.coopname = coopname;
    i.status = "published"_n;
    i.remain_units = change -> remain_units;
    i.unit_cost = change -> unit_cost;

    i.supplier_amount = i.unit_cost * i.remain_units;
    i.total_cost = i.supplier_amount;

    i.membership_fee = asset(0, cooperative.initial.symbol);
    i.cancellation_fee_amount = asset(0, cooperative.initial.symbol);
    
    i.product_lifecycle_secs = change -> product_lifecycle_secs;
    i.data = change -> data;
    i.meta = change -> meta;
    i.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());

    i.is_warranty_return = true;
    i.warranty_return_id = change -> id;
  });

  action(
    permission_level{ _marketplace, "active"_n},
    _marketplace,
    "newid"_n,
    std::make_tuple(new_parent_id, "offer")
  ).send();

  //новая встречная заявка для будущего возврата поставщику
  exchange.emplace(_marketplace, [&](auto &i) {
    i.id = new_id;
    i.parent_id = new_parent_id;
    i.type = "order"_n;

    i.program_id = parent_change -> program_id;
    i.coopname = coopname;
    
    i.username = change -> parent_username;
    i.parent_username = change -> username;
    
    i.status = "published"_n;
    
    i.remain_units = change -> remain_units;
    i.unit_cost = change -> unit_cost;
    
    i.supplier_amount = change -> supplier_amount;
    i.total_cost = change -> supplier_amount;;
    
    i.membership_fee = asset(0, cooperative.initial.symbol); //размер членского взноса должен установить председатель в методе resolve
    i.cancellation_fee_amount = asset(0, cooperative.initial.symbol);

    i.data = change -> data;
    i.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
    
    i.is_warranty_return = true;
    i.warranty_return_id = exchange_id;

    i.contribute_product_statement = document;
    i.money_contributor = parent_change -> username;
    i.product_contributor = change -> username;  
    i.product_lifecycle_secs = 0; //потому что гарантийного срока в споре нет
    
  });


  action(
    permission_level{ _marketplace, "active"_n},
    _marketplace,
    "newid"_n,
    std::make_tuple(new_id, "order"_n)
  ).send();
  
};