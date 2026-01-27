/**
 * @brief Создает инвестицию в проект
 * Создает инвестицию в проект и проводит все связанные операции:
 * - Проверяет подлинность заявления об инвестиции
 * - Валидирует сумму инвестиции
 * - Проверяет активность договора УХД и приложения к проекту
 * - Валидирует статус проекта (открыт для инвестиций)
 * - Блокирует средства в программе кошелька
 * - Добавляет инвестора как генератора с investor_base
 * - Обновляет проект - добавляет инвестиции
 * - Обрабатывает координаторские взносы если есть координатор
 * - Списывает заблокированные средства с кошелька
 * - Пополняет кошелек договора УХД и блокирует средства
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-инвестора
 * @param project_hash Хеш проекта для инвестиции
 * @param invest_hash Хеш инвестиции
 * @param amount Сумма инвестиции
 * @param statement Заявление об инвестиции
 * @ingroup public_actions
 * @ingroup public_capital_actions

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

  eosio::check(project.status == Capital::Projects::Status::ACTIVE, "Проект должен быть в статусе 'active'");

  std::string memo = Capital::Memo::get_invest_memo(contributor -> id);

  // блокируем средства в программе кошелька
  Wallet::block_funds(_capital, coopname, contributor -> username, amount, _wallet_program, memo);

  // Получаем информацию о координаторе и его сумме для взноса
  auto coordinator_info = Capital::Invests::get_coordinator_amount(coopname, username, amount);

  eosio::name coordinator_username = eosio::name{};
  asset coordinator_amount = asset(0, _root_symbol);

  // Получаем информацию о координаторе
  if (coordinator_info.has_value()) {
    auto [coord_username, coord_amount] = *coordinator_info;
    coordinator_username = coord_username;
    coordinator_amount = coord_amount;
  }

  // Добавляем инвестора как генератора с investor_base
  Capital::Core::upsert_investor_segment(coopname, project_hash, username, amount);

  // Обновляем проект - добавляем инвестиции
  Capital::Projects::add_investments(coopname, project_hash, amount);

  // Обрабатываем координаторские взносы, если есть координатор и сумма
  if (coordinator_username != eosio::name{} && coordinator_amount.amount > 0) {
    // Создаём сегмент координатора
    Capital::Core::upsert_coordinator_segment(coopname, project_hash, coordinator_username, coordinator_amount);

    // Добавляем координаторский взнос в проект
    Capital::Core::Generation::add_coordinator_funds(coopname, project_hash, coordinator_amount);

  }

  std::string approve_memo = Capital::Memo::get_approve_invest_memo(contributor -> id);

  // Списываем заблокированные средства с кошелька
  Wallet::sub_blocked_funds(_capital, coopname, contributor -> username, amount, _wallet_program, approve_memo);

  // Пополняем кошелек договора УХД и блокируем средства
  Wallet::add_blocked_funds(_capital, coopname, contributor -> username, amount, _source_program, approve_memo);

  // Фиксируем заявление об инвестиции в реестре
  Soviet::make_complete_document(
    _capital,
    coopname,
    username,
    Names::Capital::CREATE_INVESTMENT,
    invest_hash,
    statement
  );

}