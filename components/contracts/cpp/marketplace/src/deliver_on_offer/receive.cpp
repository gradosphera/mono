/**
\ingroup public_actions
\brief Получение товара заказчиком.

@details Заказчик приходит на КУ для получения имущества. Председатель КУ подписывает акт и передаёт имущество заказчику.

@param coopname Имя кооператива
@param username Имя заказчика
@param request_hash Хэш заявки
@param document Акт получения имущества

@note Авторизация требуется от аккаунта: @p coopname
**/
[[eosio::action]] void marketplace::receive(eosio::name coopname, eosio::name username, checksum256 request_hash, document2 document) {
  require_auth(coopname);
  
  requests_index requests(_marketplace, coopname.value);
  auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
  eosio::check(change_opt.has_value(), "Заявка не найдена");
  auto change = change_opt.value();
  
  eosio::check(change.status == "delivered"_n, "Получение возможно только после статуса delivered");
  eosio::check(change.money_contributor == username, "Недостаточно прав доступа");
  
  // Проверяем подпись документа
  verify_document_or_fail(document);
  
  // Валидируем документ по registry_id (пока что ноль)
  Document::validate_registry_id(document, 0);

  // Обновляем заявку
  auto change_itr = requests.find(change.id);
  eosio::check(change_itr != requests.end(), "Заявка не найдена для обновления");
  requests.modify(change_itr, _marketplace, [&](auto &o){
    o.status = "received1"_n;
    // Добавляем акт получения с именем
    Document::add_document(o.documents, DocumentNames::RECEIVE_ACT, document);
  });
}; 