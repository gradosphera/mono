/**
\ingroup public_actions
\brief Завершение поставки.

@details После истечения гарантийной задержки происходит завершение поставки.

@param coopname Имя кооператива
@param username Имя пользователя
@param request_hash Хэш заявки

@note Авторизация требуется от аккаунта: @p coopname
**/
[[eosio::action]] void marketplace::complete(eosio::name coopname, eosio::name username, checksum256 request_hash) {
  require_auth(coopname);
  
  requests_index requests(_marketplace, coopname.value);
  auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
  eosio::check(change_opt.has_value(), "Заявка не найдена");
  auto change = change_opt.value();
  
  eosio::check(change.status == "received"_n, "Завершение возможно только после статуса received");
  eosio::check(eosio::time_point_sec(eosio::current_time_point()) >= change.warranty_delay_until, "Гарантийная задержка ещё не истекла");

  // Проводки по кошельку
  std::string memo = "Завершение поставки для заказа №" + std::to_string(change.id);
  
  // Поставщик - списываем заблокированный баланс и начисляем в кошелёк
  Wallet::sub_blocked_funds(_marketplace, coopname, change.product_contributor, change.base_cost, _marketplace_program, memo);
  Wallet::add_available_funds(_marketplace, coopname, change.product_contributor, change.base_cost, _wallet_program, memo);
  
  // Членские взносы (если больше нуля)
  if (change.membership_fee_amount.amount > 0) {
    // Wallet::add_member_fee(_marketplace, coopname, change.username, _marketplace_program_id, change.membership_fee_amount, memo);
  }

  // Удаляем заявку из системы
  auto change_itr = requests.find(change.id);
  eosio::check(change_itr != requests.end(), "Заявка не найдена для удаления");
  requests.erase(change_itr);
}; 