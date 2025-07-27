/**
\ingroup public_actions
\brief Отклонение заявки.

@details Отклонение заявки с указанием причины.

@param coopname Имя кооператива
@param username Имя пользователя
@param request_hash Хэш заявки
@param meta Причина отклонения

@note Авторизация требуется от аккаунта: @p coopname
**/
[[eosio::action]] void marketplace::decline(eosio::name coopname, eosio::name username, checksum256 request_hash, std::string meta) {
  require_auth(coopname);
  
  requests_index requests(_marketplace, coopname.value);
  auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
  eosio::check(change_opt.has_value(), "Заявка не найдена");
  auto change = change_opt.value();
  
  eosio::check(change.status == "active"_n || change.status == "accepted"_n, "Можно отклонить только активную или принятую заявку");

  std::string memo = "Отклонение заявки №" + std::to_string(change.id) + ": " + meta;
  
  // Возвращаем средства заказчику если они были заблокированы
  if (change.status == "active"_n && change.money_contributor != ""_n) {
    // Списываем заблокированные средства
    Wallet::sub_blocked_funds(_marketplace, coopname, change.money_contributor, change.total_cost, _marketplace_program, memo);
    
    // Возвращаем средства в кошелёк
    Wallet::add_available_funds(_marketplace, coopname, change.money_contributor, change.total_cost, _wallet_program, memo);
  }

  // Удаляем заявку из системы
  auto change_itr = requests.find(change.id);
  eosio::check(change_itr != requests.end(), "Заявка не найдена для удаления");
  requests.erase(change_itr);
}; 