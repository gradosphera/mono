/**
\ingroup public_actions
\brief Подпись акта приёма-передачи водителем.

@details Водитель подписывает акт приёма имущества на транспортировку.
Все заявки снимаются со склада отправления.
Перевозка переходит в статус transit.

@param coopname Имя кооператива
@param hash Идентификатор перевозки
@param transport_act_driver Акт приёма-передачи подписанный водителем

@note Авторизация требуется от аккаунта: @p coopname
**/
[[eosio::action]] void marketplace::signbydriver(eosio::name coopname, checksum256 hash, document2 transport_act_driver) {
  require_auth(coopname);
  
  // Проверяем что перевозка существует
  auto shipment = Marketplace::get_shipment_by_hash_or_fail(coopname, hash, "Перевозка не найдена");
  eosio::check(shipment.status == "loading"_n, "Подписывать акт водитель может только для перевозки в статусе loading");
  
  // Проверяем подпись документа
  verify_document_or_fail(transport_act_driver);
  
  // Валидируем документ по registry_id (пока что ноль)
  Document::validate_registry_id(transport_act_driver, 0);

  requests_index requests(_marketplace, coopname.value);
  
  // Снимаем все заявки со склада отправления
  for (auto& request_hash : shipment.request_hashes) {
    auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
    eosio::check(change_opt.has_value(), "Заявка не найдена");
    auto change = change_opt.value();
    
    eosio::check(change.warehouse == shipment.source_braname, "Заявка должна находиться на складе КУ отправителя");
    
    // Снимаем заявку со склада
    auto change_itr = requests.find(change.id);
    eosio::check(change_itr != requests.end(), "Заявка не найдена для обновления");
    requests.modify(change_itr, _marketplace, [&](auto &o){
      o.warehouse = ""_n; // Снимаем со склада
    });
  }

  // Обновляем перевозку
  shipments_index shipments(_marketplace, coopname.value);
  auto hash_index = shipments.get_index<"byhash"_n>();
  auto shipment_itr = hash_index.find(hash);
  hash_index.modify(shipment_itr, _marketplace, [&](auto &s) {
    s.status = "transit"_n;
    Document::add_document(s.documents, DocumentNames::SHIPMENT_LOADING_ACT, transport_act_driver);
    s.loaded_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
  });
}; 