/**
 * @brief Создает инвестицию в проект
 * Создает инвестицию в проект с блокировкой средств и отправкой на одобрение:
 * - Проверяет подлинность заявления об инвестиции
 * - Валидирует сумму инвестиции
 * - Проверяет активность договора УХД и приложения к проекту
 * - Валидирует статус проекта (открыт для инвестиций)
 * - Блокирует средства в программе кошелька
 * - Создает инвестицию и отправляет на одобрение
 * - Обновляет информацию о координаторе если необходимо
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-инвестора
 * @param project_hash Хеш проекта для инвестиции
 * @param invest_hash Хеш инвестиции
 * @param amount Сумма инвестиции
 * @param statement Заявление об инвестиции
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_createinvest
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::createinvest(name coopname, name username, checksum256 project_hash, checksum256 invest_hash, asset amount, document2 statement) {
  require_auth(coopname);
  
  verify_document_or_fail(statement, {username});
  
  // Проверяем существование проекта
  Wallet::validate_asset(amount);
  
  // Проверяем основной договор УХД
  auto contributor = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, project_hash, username);
  
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  eosio::check(project.is_opened == true, "Проект закрыт для инвестиций");
  
  eosio::check(project.status == Capital::Projects::Status::ACTIVE || project.status == Capital::Projects::Status::VOTING, "Проект должен быть в статусе 'active' или 'voting'");
  
  std::string memo = Capital::Memo::get_invest_memo(contributor -> id);
  
  // блокируем средства в программе кошелька
  Wallet::block_funds(_capital, coopname, contributor -> username, amount, _wallet_program, memo);

  // Создаем инвестицию и отправляем на approve
  Capital::Invests::create_invest_with_approve(coopname, username, project_hash, invest_hash, amount, statement);

  // Получаем информацию о координаторе и его сумме для взноса
  auto coordinator_info = Capital::Invests::get_coordinator_amount(coopname, username, amount);
  
  // Обновляем информацию о координаторе в инвестиции, если она есть
  if (coordinator_info.has_value()) {
    auto [coordinator_username, coordinator_amount] = *coordinator_info;
    Capital::Invests::set_coordinator_info(coopname, invest_hash, coordinator_username, coordinator_amount);
  }
  
}