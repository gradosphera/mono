/**
\ingroup public_actions
\brief Принятие или отказ поставщика от товара в рамках гарантийного возврата

@details Поставщик может принять товар (accept=true) или отказаться от него (accept=false).
При принятии товар передается поставщику и диспут завершается.
При отказе товар остается у кооператива и диспут завершается.

@param coopname Имя кооператива
@param username Имя поставщика
@param request_hash Хэш заявки с диспутом
@param accept Принимает ли поставщик товар (true/false)
@param document Документ с решением поставщика

@note Авторизация требуется от аккаунта: @p coopname
*/
[[eosio::action]] void marketplace::waccept(eosio::name coopname, eosio::name username, checksum256 request_hash, bool accept, document2 document) {
  require_auth(coopname);

  auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
  eosio::check(change_opt.has_value(), "Заявка не найдена");
  auto change = change_opt.value();
  
  eosio::check(change.status == "woffered"_n, "Товар должен быть предложен поставщику");
  eosio::check(change.product_contributor == username, "Только поставщик может принять решение о товаре");

  // Проверяем подпись документа
  verify_document_or_fail(document);

  requests_index requests(_marketplace, coopname.value);
  auto change_itr = requests.find(change.id);
  eosio::check(change_itr != requests.end(), "Заявка не найдена для обновления");

  if (accept) {
    // Поставщик принимает товар
    requests.modify(change_itr, _marketplace, [&](auto &ch) {
      ch.status = "wcompleted"_n;
      Document::add_document(ch.documents, Marketplace::DocumentNames::WACCEPT_ACT, document);
    });
  } else {
    // Поставщик отказывается от товара
    requests.modify(change_itr, _marketplace, [&](auto &ch) {
      ch.status = "wdeclined"_n;
      Document::add_document(ch.documents, Marketplace::DocumentNames::WACCEPT_ACT, document);
    });
  }

} 