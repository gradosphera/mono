/**
\ingroup public_actions
\brief Поставка имущества в кооператив.

@details Поставщик поставляет имущество на указанный кооперативный участок и предоставляет подписанный акт приёма-передачи.

@param coopname Имя кооператива
@param username Имя поставщика
@param request_hash Хэш заявки
@param act Акт поставки имущества

@note Авторизация требуется от аккаунта: @p coopname
**/
[[eosio::action]] void marketplace::supply(eosio::name coopname, eosio::name username, checksum256 request_hash, document2 act) {
  require_auth(coopname);
  
  requests_index requests(_marketplace, coopname.value);
  auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
  eosio::check(change_opt.has_value(), "Заявка не найдена");
  auto change = change_opt.value();
  
  eosio::check(change.status == "authorized"_n, "Только авторизованная заявка может быть поставлена");
  eosio::check(change.product_contributor == username, "Недостаточно прав доступа");
  
  // Проверяем подпись документа
  verify_document_or_fail(act);
  
  // Валидируем документ по registry_id (пока что ноль)
  Document::validate_registry_id(act, 0);

  // Обновляем заявку
  auto change_itr = requests.find(change.id);
  eosio::check(change_itr != requests.end(), "Заявка не найдена для обновления");
  requests.modify(change_itr, _marketplace, [&](auto &o){
    o.status = "supplied1"_n;
    o.supplied_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
    // Добавляем акт поставки с именем
    Document::add_document(o.documents, DocumentNames::SUPPLY_ACT, act);
  });
}; 