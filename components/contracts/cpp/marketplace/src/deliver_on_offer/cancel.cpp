/**
\ingroup public_actions
\brief Отмена заявки пользователем.

@details Пользователь может отменить свою заявку с учетом комиссии за отмену.

@param coopname Имя кооператива
@param username Имя пользователя
@param request_hash Хэш заявки

@note Авторизация требуется от аккаунта: @p coopname
**/
[[eosio::action]] void marketplace::cancel(eosio::name coopname, eosio::name username, checksum256 request_hash) {
  require_auth(coopname);
  
  requests_index requests(_marketplace, coopname.value);
  auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
  eosio::check(change_opt.has_value(), "Заявка не найдена");
  auto change = change_opt.value();
  
  // Проверяем права доступа
  eosio::check(change.username == username || change.product_contributor == username, "Недостаточно прав доступа");
  
  // Ограничения отмены
  eosio::check(change.status != "completed"_n, "Нельзя отменить завершенную заявку");
  eosio::check(change.status != "canceled"_n, "Заявка уже отменена");
  eosio::check(change.status != "declined"_n, "Нельзя отменить отклоненную заявку");
  
  // Поставщик не может отменить заявку после поставки
  if ((change.money_contributor != username && change.product_contributor != username) ||
      (change.product_contributor == username && (change.status == "supplied1"_n || change.status == "supplied2"_n ||
        change.status == "delivered"_n || change.status == "received1"_n || change.status == "received2"_n))) {
    eosio::check(false, "Поставщик не может отменить заявку после поставки");
  }

  std::string memo = "Отмена заявки №" + std::to_string(change.id);
  
  // Возвращаем средства заказчику с учетом комиссии за отмену
  if (username == change.money_contributor) {
    eosio::asset return_amount = change.total_cost - change.cancellation_fee_amount;
    
    // Списываем заблокированные средства
    Wallet::sub_blocked_funds(_marketplace, coopname, change.money_contributor, change.total_cost, _marketplace_program, memo);
    
    // Возвращаем средства в кошелёк
    Wallet::add_available_funds(_marketplace, coopname, change.money_contributor, return_amount, _wallet_program, memo);
    
    // Направляем комиссию в фонд членских взносов
    if (change.cancellation_fee_amount.amount > 0) {
      Wallet::add_member_fee(_marketplace, coopname, change.username, _marketplace_program_id, change.cancellation_fee_amount, memo);
    }
  }

  // Удаляем заявку из системы
  auto change_itr = requests.find(change.id);
  eosio::check(change_itr != requests.end(), "Заявка не найдена для удаления");
  requests.erase(change_itr);
};



