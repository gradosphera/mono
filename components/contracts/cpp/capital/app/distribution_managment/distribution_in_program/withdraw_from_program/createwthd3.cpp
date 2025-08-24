/**
 * @brief Создает заявку на возврат из программы капитализации
 * Создает заявку на возврат средств из программы капитализации:
 * - Проверяет подлинность заявления о возврате
 * - Валидирует активность основного договора УХД
 * - Обновляет CRPS contributor
 * - Проверяет уникальность заявки по хешу
 * - Обрабатывает вывод средств через core функцию
 * - Создает заявку на возврат
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-участника
 * @param withdraw_hash Хеш заявки на возврат
 * @param amount Сумма возврата
 * @param return_statement Заявление о возврате
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::createwthd3(name coopname, name username, checksum256 withdraw_hash, asset amount, document2 return_statement) {
  require_auth(coopname);

  verify_document_or_fail(return_statement);

  // Проверяем основной договор УХД
  auto exist_contributor = Capital::Contributors::get_contributor(coopname, username);
  eosio::check(exist_contributor.has_value(), "Пайщик не подписывал основной договор УХД");
  eosio::check(exist_contributor->status == Capital::Contributors::Status::ACTIVE, 
               "Основной договор УХД не активен");

  // Сначала обновляем CRPS contributor
  Capital::Core::refresh_contributor_program_rewards(coopname, username);

  // Проверяем что заявка не существует
  auto exist_withdraw = Capital::get_program_withdraw(coopname, withdraw_hash);
  eosio::check(!exist_withdraw.has_value(), "Заявка на возврат с таким хэшем уже существует");

  // Обрабатываем вывод средств через core функцию
  std::string memo = Capital::Memo::get_create_program_withdraw_memo();
  Capital::Core::process_contributor_program_withdrawal(coopname, username, amount, memo);

  // Создаем заявку на возврат
  Capital::program_withdraws_index program_withdraws(_capital, coopname.value);
  
  program_withdraws.emplace(coopname, [&](auto &w) {
    w.id = get_global_id_in_scope(_capital, coopname, "withdraws3"_n);
    w.status = Capital::ProgramWithdraw::Status::CREATED;
    w.coopname = coopname;
    w.withdraw_hash = withdraw_hash;
    w.username = username;
    w.amount = amount;
    w.statement = return_statement;
  });
}