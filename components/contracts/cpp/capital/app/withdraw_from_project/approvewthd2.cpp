/**
 * @brief Одобряет заявку на возврат из проекта
 * Одобряет заявку на возврат из проекта и отправляет в совет:
 * - Проверяет подлинность одобренного заявления о возврате
 * - Получает объект возврата и обновляет его статус на approved
 * - Отправляет заявку в совет для рассмотрения
 * @param coopname Наименование кооператива
 * @param approver Наименование пользователя-одобряющего
 * @param withdraw_hash Хеш заявки на возврат для одобрения
 * @param approved_return_statement Одобренное заявление о возврате
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::approvewthd2(name coopname, name approver, checksum256 withdraw_hash, document2 approved_return_statement) {
  require_auth(coopname);
  
  verify_document_or_fail(approved_return_statement);
  
  auto exist_withdraw = Capital::get_project_withdraw(coopname, withdraw_hash);
  eosio::check(exist_withdraw.has_value(), "Объект возврата не найден");
  
  Capital::project_withdraws_index project_withdraws(_capital, coopname.value);
  auto withdraw = project_withdraws.find(exist_withdraw -> id);

  project_withdraws.modify(withdraw, coopname, [&](auto &i) {
    i.status = Capital::ProjectWithdraw::Status::APPROVED;
    i.statement = approved_return_statement;
  });
  
  //отправляем в совет
  ::Soviet::create_agenda(
    _capital,
    coopname, 
    exist_withdraw -> username, 
    Names::SovietActions::CAPITAL_WITHDRAW_FROM_PROJECT,
    withdraw_hash, 
    _capital, 
    Names::Capital::AUTHORIZE_PROJECT_WITHDRAW,
    Names::Capital::DECLINE_PROJECT_WITHDRAW, 
    exist_withdraw -> statement, 
    std::string("")
  );  

};