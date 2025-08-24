/**
 * @brief Создает заявку на возврат из проекта
 * Создает заявку на возврат средств из проекта с проверкой доступности:
 * - Проверяет подлинность заявления о возврате
 * - Валидирует существование проекта и активность договора УХД
 * - Проверяет наличие приложения к проекту
 * - Валидирует существование и актуальность кошелька проекта
 * - Проверяет достаточность накопленных средств от членских взносов
 * - Создает заявку на возврат без изменения долей участника
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-участника
 * @param project_hash Хеш проекта
 * @param withdraw_hash Хеш заявки на возврат
 * @param amount Сумма возврата
 * @param return_statement Заявление о возврате
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::createwthd2(name coopname, name username, checksum256 project_hash, checksum256 withdraw_hash, asset amount, document2 return_statement) {
  require_auth(coopname);

  verify_document_or_fail(return_statement);

  auto exist_project = Capital::Projects::get_project(coopname, project_hash);
  eosio::check(exist_project.has_value(), "Проект с указанным хэшем не найден");

  // Проверяем основной договор УХД
  auto exist_contributor = Capital::Contributors::get_contributor(coopname, username);
  eosio::check(exist_contributor.has_value(), "Пайщик не подписывал основной договор УХД");
  eosio::check(exist_contributor -> status == Capital::Contributors::Status::ACTIVE, "Основной договор УХД не активен");
  
  // Проверяем приложение к проекту
  eosio::check(Capital::Contributors::is_contributor_has_appendix_in_project(coopname, project_hash, username), 
               "Пайщик не подписывал приложение к договору УХД для данного проекта");

  // Проверяем что кошелек проекта существует и обновлен
  auto project_wallet = Capital::get_project_wallet_or_fail(coopname, project_hash, username, 
                                                           "Кошелек проекта не найден. Необходимо сначала сконвертировать сегмент в кошелек проекта");

  // Обновляем кошелек проекта перед проверкой
  Capital::Core::refresh_project_wallet_membership_rewards(coopname, project_hash, username);
  
  // Получаем обновленный кошелек проекта
  auto updated_wallet = Capital::get_project_wallet_or_fail(coopname, project_hash, username, 
                                                          "Кошелек проекта не найден");

  // Проверяем достаточность накопленных средств от членских взносов
  eosio::check(updated_wallet.membership_available >= amount, 
               "Недостаточно накопленных средств от членских взносов для создания запроса на возврат");

  // Проверяем достаточность available средств в проекте
  Capital::Projects::subtract_membership_available(coopname, project_hash, amount);

  // Запись возврата без изменения долей участника
  auto exist_withdraw = Capital::get_project_withdraw(coopname, withdraw_hash);
  eosio::check(!exist_withdraw.has_value(), "Заявка на взнос-возврат с таким хэшем уже существует");

  Capital::project_withdraws_index project_withdraws(_capital, coopname.value);
  
  project_withdraws.emplace(coopname, [&](auto &w) {
    w.id = get_global_id_in_scope(_capital, coopname, "withdraws2"_n);
    w.status = Capital::ProjectWithdraw::Status::CREATED;
    w.coopname = coopname;
    w.withdraw_hash = withdraw_hash;
    w.project_hash = project_hash;
    w.username = username;
    w.amount = amount;
    w.statement = return_statement;
  });
}