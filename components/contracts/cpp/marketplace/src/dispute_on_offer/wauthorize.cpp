/**
\ingroup public_actions
\brief Авторизация гарантийного возврата советом

@details Совет авторизует принятие товара от заказчика и его последующую выдачу поставщику

@param coopname Имя кооператива
@param request_hash Хэш заявки с диспутом
@param wreturn_decision_id Идентификатор решения по принятию товара
@param wreturn_authorization Документ авторизации принятия товара
@param wsupply_decision_id Идентификатор решения по выдаче товара поставщику
@param wsupply_authorization Документ авторизации выдачи товара

@note Авторизация требуется от аккаунта: @p _soviet
*/
[[eosio::action]] void marketplace::wauthorize(eosio::name coopname, checksum256 request_hash, uint64_t wreturn_decision_id, document2 wreturn_authorization, uint64_t wsupply_decision_id, document2 wsupply_authorization) {
  require_auth(_soviet);

  auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
  eosio::check(change_opt.has_value(), "Заявка не найдена");
  auto change = change_opt.value();
  
  eosio::check(change.status == "disputed"_n, "Заявка должна быть в статусе диспута");
  
  // Обновляем статус заявки и добавляем документы авторизации
  requests_index requests(_marketplace, coopname.value);
  auto change_itr = requests.find(change.id);
  eosio::check(change_itr != requests.end(), "Заявка не найдена для обновления");
  requests.modify(change_itr, _soviet, [&](auto &o) { 
    o.status = "wauthorized"_n;
    Document::add_document(o.documents, Marketplace::DocumentNames::WRETURN_AUTH, wreturn_authorization);
    Document::add_document(o.documents, Marketplace::DocumentNames::WSUPPLY_AUTH, wsupply_authorization);
  });
}; 