
/**
\ingroup public_actions
\brief Подтверждение готовности выполнить заявку.

@details Данный метод позволяет пользователю, который получил предложение по своей заявке, подтвердить свою готовность его принять и выполнить. При этом формируется пакет документов, который отправляется в совет на утверждение. 

@param username Имя пользователя, подтверждающего готовность выполнить предложение.
@param exchange_id ID предложения, которое следует подтвердить.
 
@note Авторизация требуется от аккаунта: @p username
*/
[[eosio::action]] void marketplace::accept(eosio::name coopname, eosio::name username, uint64_t exchange_id, document document) { 
  require_auth(coopname);
  
 requests_index exchange(_marketplace, coopname.value);
  auto change = exchange.find(exchange_id);
  eosio::check(change != exchange.end(), "Заявка не найдена");
  eosio::check(change -> status == "published"_n, "Только заявка в статусе ожидания может быть принята");

  auto parent_change = exchange.find(change -> parent_id);
  eosio::check(parent_change != exchange.end(), "Родительская заявка не найдена");
  eosio::check(parent_change -> username == username, "Недостаточно прав доступа");
  eosio::check(parent_change -> remain_units >= change -> remain_units, "Недостаточно объектов для поставки");
  
  // Проверяем подпись документа
  verify_document_or_fail(document);

  exchange.modify(parent_change, _marketplace, [&](auto &i) {
    i.remain_units -= change -> remain_units;
    i.supplier_amount = (parent_change -> remain_units - change -> remain_units ) * parent_change -> unit_cost;
    i.blocked_units += change -> remain_units;
  });

  exchange.modify(change, _marketplace, [&](auto &o){
    o.status = "accepted"_n;
    o.blocked_units += change -> remain_units;
    o.remain_units = 0;
    o.accepted_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());

    if (change -> type == "order"_n) {
      o.contribute_product_statement = document;
    } else if (change -> type == "offer"_n) {
      o.return_product_statement = document;
    };

  });

  action(
    permission_level{ _marketplace, "active"_n},
    _soviet,
    _change_action,
    std::make_tuple(change -> coopname, username, change -> username, exchange_id, change -> money_contributor, change -> product_contributor)
  ).send();
}
