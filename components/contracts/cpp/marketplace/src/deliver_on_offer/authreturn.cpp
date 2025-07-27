/**
\ingroup public_actions
\brief Авторизация заявления на возврат имущества советом кооператива.

@details Совет кооператива авторизует заявление на возврат имущества.

@param coopname Имя кооператива
@param request_hash Хэш заявки
@param authorization Документ авторизации от совета

@note Авторизация требуется от аккаунта: @p _soviet
**/
[[eosio::action]] void marketplace::authreturn(eosio::name coopname, checksum256 request_hash, document2 authorization) {
  require_auth(_soviet);
  
  requests_index requests(_marketplace, coopname.value);
  auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
  eosio::check(change_opt.has_value(), "Заявка не найдена");
  auto change = change_opt.value();
  
  eosio::check(change.status == "accepted"_n, "Только принятая заявка может быть авторизована");
  
  // Проверяем подпись документа
  verify_document_or_fail(authorization);
  
  // Валидируем документ по registry_id (пока что ноль)
  Document::validate_registry_id(authorization, 0);

  // Обновляем заявку
  auto change_itr = requests.find(change.id);
  eosio::check(change_itr != requests.end(), "Заявка не найдена для обновления");
  requests.modify(change_itr, _marketplace, [&](auto &o){
    // Добавляем документ авторизации возврата с именем
    Document::add_document(o.documents, DocumentNames::RETURN_AUTH, authorization);
    
    // Проверяем, есть ли уже оба документа авторизации
    bool has_contrib_auth = Document::has_document(o.documents, DocumentNames::CONTRIB_AUTH);
    bool has_return_auth = Document::has_document(o.documents, DocumentNames::RETURN_AUTH);
    
    // Если получили оба документа авторизации, переводим в статус authorized
    if (has_contrib_auth && has_return_auth) {
      o.status = "authorized"_n;
    }
  });
}; 