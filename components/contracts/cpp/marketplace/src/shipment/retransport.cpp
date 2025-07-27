/**
\ingroup public_actions
\brief Промежуточная передача товаров между складами.

@details Создает новую перевозку для доставленных заявок, позволяя передать все товары
из текущего склада в другое место назначения с новым водителем.

@param coopname Имя кооператива
@param completed_hash Внешний идентификатор новой перевозки
@param new_driver_username Имя нового водителя-пайщика
@param source_braname КУ с которого забираем товары
@param new_destination_braname Новый КУ назначения
@param request_hashes Массив хэшей заявок для переотправки
@param transport_act_sender Акт передачи от текущего склада

@note Авторизация требуется от аккаунта: @p coopname
**/
[[eosio::action]] void marketplace::retransport(eosio::name coopname, checksum256 completed_hash, eosio::name new_driver_username, eosio::name source_braname, eosio::name new_destination_braname, std::vector<checksum256> request_hashes, document2 transport_act_sender) {
  require_auth(coopname);
  
  // Проверяем что есть хотя бы одна заявка
  eosio::check(!request_hashes.empty(), "Должна быть указана хотя бы одна заявка");
  
  // Проверяем что перевозка с таким hash не существует
  auto existing_shipment = Marketplace::get_shipment_by_hash(coopname, completed_hash);
  eosio::check(!existing_shipment.has_value(), "Перевозка с таким идентификатором уже существует");
  
  // Проверяем подпись документа
  verify_document_or_fail(transport_act_sender);
  
  // Валидируем документ по registry_id (пока что ноль)
  Document::validate_registry_id(transport_act_sender, 0);

  requests_index requests(_marketplace, coopname.value);
  
  // Проверяем все заявки но НЕ снимаем их со склада (это будет при signbydriver)
  for (auto& request_hash : request_hashes) {
    auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
    eosio::check(change_opt.has_value(), "Заявка не найдена");
    auto change = change_opt.value();
    
    eosio::check(change.status == "delivered"_n, "Переотправлять можно только доставленные заявки");
    eosio::check(change.warehouse == source_braname, "Заявка должна находиться на указанном складе");
  }
  
  // Получаем новый ID для перевозки
  uint64_t next_shipment_id = get_global_id_in_scope(_marketplace, coopname, "shipments"_n);
  
  // Создаем новую перевозку
  shipments_index shipments(_marketplace, coopname.value);
  shipments.emplace(_marketplace, [&](auto &s) {
    s.id = next_shipment_id;
    s.hash = completed_hash;
    s.coopname = coopname;
    s.driver_username = new_driver_username;
    s.source_braname = source_braname;
    s.destination_braname = new_destination_braname;
    s.status = "loading"_n;
    s.request_hashes = request_hashes;
    
    // Добавляем первый документ
    Document::add_document(s.documents, DocumentNames::SHIPMENT_SEND_ACT, transport_act_sender);
    
    s.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
  });
}; 