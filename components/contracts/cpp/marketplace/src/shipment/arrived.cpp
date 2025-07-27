/**
\ingroup public_actions
\brief Перевозка прибыла в место назначения.

@details Перевозка переходит в статус arrived и ожидает подписи получателя.

@param coopname Имя кооператива
@param hash Идентификатор перевозки
@param transport_act_delivery Акт доставки подписанный водителем

@note Авторизация требуется от аккаунта: @p coopname
**/
[[eosio::action]] void marketplace::arrived(eosio::name coopname, checksum256 hash, document2 transport_act_delivery) {
  require_auth(coopname);
  
  // Проверяем что перевозка существует
  auto shipment = Marketplace::get_shipment_by_hash_or_fail(coopname, hash, "Перевозка не найдена");
  eosio::check(shipment.status == "transit"_n, "Подписывать акт доставки можно только для перевозки в статусе transit");
  
  // Проверяем подпись документа
  verify_document_or_fail(transport_act_delivery, { shipment.driver_username });
  
  // Валидируем документ по registry_id (пока что ноль)
  Document::validate_registry_id(transport_act_delivery, 0);

  // Обновляем перевозку - добавляем третий акт
  shipments_index shipments(_marketplace, coopname.value);
  auto hash_index = shipments.get_index<"byhash"_n>();
  auto shipment_itr = hash_index.find(hash);
  hash_index.modify(shipment_itr, _marketplace, [&](auto &s) {
    s.status = "arrived"_n; // Новый статус - прибыл, ожидает приёма получателем
    Document::add_document(s.documents, DocumentNames::SHIPMENT_ARRIVE_ACT, transport_act_delivery);
    s.delivered_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
  });
}; 