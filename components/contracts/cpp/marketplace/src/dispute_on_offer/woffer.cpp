/**
\ingroup public_actions
\brief Предложение товара поставщику в рамках гарантийного возврата

@details Кооператив предлагает поставщику забрать товар, возвращенный заказчиком.
Создается предложение с актом передачи.

@param coopname Имя кооператива
@param username Имя председателя, предлагающего товар
@param request_hash Хэш заявки с диспутом
@param document Акт передачи товара поставщику

@note Авторизация требуется от аккаунта: @p coopname
*/
[[eosio::action]] void marketplace::woffer(eosio::name coopname, eosio::name username, checksum256 request_hash, document2 document) {
  require_auth(coopname);

  auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
  eosio::check(change_opt.has_value(), "Заявка не найдена");
  auto change = change_opt.value();
  
  eosio::check(change.status == "wreturned"_n, "Товар может быть предложен только после возврата в кооператив");

  auto soviet = get_board_by_type_or_fail(coopname, "soviet"_n);
  auto chairman = soviet.get_chairman();
  
  eosio::check(username == chairman, "Недостаточно прав доступа для предложения товара");
  
  // Проверяем подпись документа
  verify_document_or_fail(document);

  // Обновляем статус заявки и добавляем акт предложения товара
  requests_index requests(_marketplace, coopname.value);
  auto change_itr = requests.find(change.id);
  eosio::check(change_itr != requests.end(), "Заявка не найдена для обновления");
  requests.modify(change_itr, _marketplace, [&](auto &ch) {
    ch.status = "woffered"_n;
    Document::add_document(ch.documents, Marketplace::DocumentNames::WOFFER_ACT, document);
  });
} 