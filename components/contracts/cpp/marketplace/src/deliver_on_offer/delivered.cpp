/**
\ingroup public_actions
\brief Перевод заявки в статус готово к выдаче.

@details Председатель КУ переводит заявку в статус delivered независимо от транспортировки.
Используется когда транспортировка между КУ не нужна или имущество уже находится на складе.
Просто перевод статуса без дополнительных документов.

@param coopname Имя кооператива
@param username Имя пользователя (может быть поставщиком или заказчиком)
@param request_hash Хэш заявки

@note Авторизация требуется от аккаунта: @p coopname
**/
[[eosio::action]] void marketplace::delivered(eosio::name coopname, eosio::name username, checksum256 request_hash) {
  require_auth(coopname);
  
  requests_index requests(_marketplace, coopname.value);
  auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
  eosio::check(change_opt.has_value(), "Заявка не найдена");
  auto change = change_opt.value();
  
  // Проверяем что заявка в подходящем статусе (после поставки или перемещения со склада)
  eosio::check(change.status == "supplied2"_n || change.status == "shiprecvd"_n, "Перевод в статус delivered возможен только после поставки (supplied2) или после получения на склад (shiprecvd)");

  // Обновляем заявку - просто перевод статуса
  auto change_itr = requests.find(change.id);
  eosio::check(change_itr != requests.end(), "Заявка не найдена для обновления");
  requests.modify(change_itr, _marketplace, [&](auto &o){
    o.status = "delivered"_n;
    o.delivered_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
    // Устанавливаем крайний срок получения (3 дня)
    o.deadline_for_receipt = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + 3 * 24 * 60 * 60);
  });
}; 