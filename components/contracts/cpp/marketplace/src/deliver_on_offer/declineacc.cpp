/**
\ingroup public_actions
\brief Отклонение принятия заявки советом (declineacc).

@details Данный метод вызывается советом когда заявление на конвертацию, возврат или взнос отклоняется.
После рефакторинга работаем только с одной заявкой orderoffer.

@param coopname Имя кооператива
@param request_hash Хэш заявки, которая должна быть отменена
@param reason Причина отклонения

@note Авторизация требуется от аккаунта: @p _soviet
*/
[[eosio::action]] void marketplace::declineacc(eosio::name coopname, checksum256 request_hash, std::string reason) {
  require_auth(_soviet);
  
  requests_index requests(_marketplace, coopname.value);
  auto change_opt = Marketplace::get_request_by_hash(coopname, request_hash);
  
  // Если заявка не найдена, ничего не делаем (возможно уже удалена)
  if (!change_opt.has_value()) {
    print("Заявка уже удалена или не найдена. Кооператив: ", coopname, ", причина: ", reason);
    return;
  }
  
  auto change = change_opt.value();
  
  // Логирование отклонения
  print("Отклонение заявления советом. Заявка ID: ", change.id, ", причина: ", reason);
  
  // Отклоняем заявку
  decline_request(coopname, change);
}

/**
 * @brief Статический метод для отклонения заявки (используется советом)
 */
void marketplace::decline_request(eosio::name coopname, const request& change) {
  requests_index requests(_marketplace, coopname.value);
  
  // Проверяем, что заявка все еще существует
  auto change_itr = requests.find(change.id);
  if (change_itr == requests.end()) {
    return; // Заявка уже удалена
  }
  
  std::string memo = "Отклонение заявления советом по программе №" + std::to_string(_marketplace_program_id) + " для заявки ID: " + std::to_string(change.id);
  
  // Возвращаем средства заказчику если они были заблокированы
  if (change.type == "orderoffer"_n && change.total_cost.amount > 0 && change.money_contributor != ""_n) {
    // Списываем заблокированные средства с маркетплейса
    Wallet::sub_blocked_funds(_marketplace, coopname, change.money_contributor, change.total_cost, _marketplace_program, memo);
    
    // Возвращаем средства в кошелёк
    Wallet::add_available_funds(_marketplace, coopname, change.money_contributor, change.total_cost, _wallet_program, memo);
  }

  // Удаляем заявку из системы
  requests.erase(change_itr);
}

 