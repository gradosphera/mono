/**
\ingroup public_actions
\brief Приём имущества на склад по накладной.

@details Представитель КУ получения принимает имущество на склад по накладной.
Все заявки из перевозки переходят в статус delivered и ставятся на склад КУ получения.
Объект перевозки удаляется.

@param coopname Имя кооператива
@param hash Идентификатор перевозки
@param warehouse_receipt_act Акт приёма на склад подписанный получателем

@note Авторизация требуется от аккаунта: @p coopname
**/
[[eosio::action]] void marketplace::receiveshipm(eosio::name coopname, checksum256 hash, document2 warehouse_receipt_act) {
  require_auth(coopname);
  
  // Проверяем что перевозка существует
  auto shipment = Marketplace::get_shipment_by_hash_or_fail(coopname, hash, "Перевозка не найдена");
  eosio::check(shipment.status == "arrived"_n, "Принимать имущество на склад можно только для перевозки в статусе arrived");
  
  // Проверяем подпись документа
  verify_document_or_fail(warehouse_receipt_act);
  
  // Валидируем документ по registry_id (пока что ноль)
  Document::validate_registry_id(warehouse_receipt_act, 0);

  requests_index requests(_marketplace, coopname.value);
  
  // Обновляем все заявки из перевозки - ставим их на склад получения
  for (auto& request_hash : shipment.request_hashes) {
    auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
    eosio::check(change_opt.has_value(), "Заявка не найдена");
    auto change = change_opt.value();
    
    // Обновляем заявку
    auto change_itr = requests.find(change.id);
    eosio::check(change_itr != requests.end(), "Заявка не найдена для обновления");
    requests.modify(change_itr, _marketplace, [&](auto &o){
      o.status = "shiprecvd"_n; // Доставка получена
      o.warehouse = shipment.destination_braname; // Ставим на склад КУ получения
      o.delivered_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
      // Устанавливаем крайний срок получения (3 дня)
      o.deadline_for_receipt = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + 3 * 24 * 60 * 60);
      // Добавляем акт приёма на складе получателем
      Document::add_document(o.documents, DocumentNames::SHIPMENT_RECV_ACT, warehouse_receipt_act);
    });
  }

  // Удаляем объект перевозки после завершения
  shipments_index shipments(_marketplace, coopname.value);
  auto hash_index = shipments.get_index<"byhash"_n>();
  auto shipment_itr = hash_index.find(hash);
  hash_index.erase(shipment_itr);
}; 