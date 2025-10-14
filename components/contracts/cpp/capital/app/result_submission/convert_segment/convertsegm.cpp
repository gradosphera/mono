/**

*
 * @brief Конвертирует сегмент участника в различные типы кошельков
 * Конвертирует сегмент участника в кошелек, капитал и кошелек проекта:
 * - Проверяет статус сегмента (должен быть contributed - результат внесён и принят)
 * - Валидирует актуальность сегмента
 * - Проверяет что долг уже погашен после pushrslt
 * - Проверяет наличие средств для конвертации (с учетом погашенного долга)
 * - Валидирует корректность сумм конвертации
 * - Выполняет операции с балансами (кошелек, капитал, проект)
 * - Обновляет сегмент и доли проекта
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-участника
 * @param project_hash Хеш проекта
 * @param convert_hash Хеш конвертации
 * @param wallet_amount Сумма для конвертации в кошелек
 * @param capital_amount Сумма для конвертации в капитал
 * @param project_amount Сумма для конвертации в кошелек проекта
 * @param convert_statement Заявление о конвертации
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::convertsegm(eosio::name coopname, eosio::name username,
                          checksum256 project_hash, checksum256 convert_hash, 
                          eosio::asset wallet_amount, eosio::asset capital_amount, eosio::asset project_amount,
                          document2 convert_statement) {
  require_auth(coopname);
  
  // Получаем сегмент пайщика
  auto segment = Capital::Segments::get_segment_or_fail(coopname, project_hash, username, 
                                                      "Сегмент пайщика не найден");
  
  // Проверяем статус сегмента - результат должен быть внесён после pushrslt
  eosio::check(segment.status == Capital::Segments::Status::CONTRIBUTED, "Результат не внесён. Сначала внесите результат через pushrslt");
  
  // Проверяем актуальность сегмента (включая синхронизацию с инвестициями)
  Capital::Segments::check_segment_is_updated(coopname, project_hash, username, "Сегмент не обновлен. Выполните rfrshsegment перед конвертацией");
  
  // === ФАЗА 1: БАЗОВЫЕ ПРОВЕРКИ ===
  Wallet::validate_asset(wallet_amount);
  Wallet::validate_asset(capital_amount);
  Wallet::validate_asset(project_amount);
  
  print("wallet_amount: ", wallet_amount.to_string());
  print("capital_amount: ", capital_amount.to_string());
  print("project_amount: ", project_amount.to_string());
  
  // Доступная сумма для конвертации в кошелек
  eosio::asset available_for_wallet = segment.provisional_amount - segment.debt_amount;
  print("available_for_wallet: ", available_for_wallet.to_string());
  eosio::check(wallet_amount <= available_for_wallet, "Сумма конвертации в кошелек превышает доступную и обеспеченную суммы. Для конвертации доступна обеспеченная сумма за вычетом суммы выданных ссуд (provisional_amount - debt_amount)");
  
  // Доступная сумма для конвертации в проект (все базовые суммы всех ролей за вычетом выданных ссуд)
  eosio::asset available_for_project = segment.creator_base + segment.author_base + segment.coordinator_base + segment.investor_base + segment.property_base - segment.debt_amount;
  print("available_for_project: ", available_for_project.to_string());
  eosio::check(project_amount <= available_for_project, "Сумма конвертации в проект превышает себестоимость вкладов за вычетом суммы выданных ссуд");
  
  // Доступная сумма для конвертации в программу
  eosio::asset available_for_program = segment.total_segment_cost - segment.debt_amount;
  print("available_for_program: ", available_for_program.to_string());

  // Проверяем что общая сумма конвертации равна доступной сумме для конвертации в программу
  eosio::asset total_convert = wallet_amount + capital_amount + project_amount;
  print("total_convert: ", total_convert.to_string());
  eosio::check(total_convert == available_for_program, "Общая сумма конвертации должна равняться сумме всех себестоимостей и премий за вычетом суммы выданных ссуд");

  eosio::check(capital_amount <= available_for_program, "Сумма конвертации в программу превышает сумму себестоимости и премий за вычетом суммы выданных ссуд");
  eosio::check(capital_amount == (available_for_program - wallet_amount - project_amount), "В программу должно быть сконвертировано всё доступное, что не конвертируется в проект или кошелёк");

  // Списываем средства с кошелька генерации, которые уходят из проекта
  Wallet::sub_blocked_funds(_capital, coopname, username, total_convert - project_amount, _source_program, Capital::Memo::get_convert_segment_to_wallet_memo(convert_hash));
    
  // Выполняем операции с балансами
  if (wallet_amount.amount > 0) {
    // Конвертация в кошелек
    Wallet::add_available_funds(_capital, coopname, username, wallet_amount, _wallet_program,
                               Capital::Memo::get_convert_segment_to_wallet_memo(convert_hash));
  }
  
  if (capital_amount.amount > 0) {
    // Конвертация в капитал
    Wallet::add_blocked_funds(_capital, coopname, username, capital_amount, _capital_program,
                             Capital::Memo::get_convert_segment_to_capital_memo(convert_hash));
  }
  
  if (project_amount.amount > 0) {
    // Определяем целевой проект для конвертации
    auto current_project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    checksum256 target_project_hash = project_hash;
    checksum256 empty_hash = checksum256();
    
    // Если у текущего проекта есть родительский проект - конвертируем в него
    if (current_project.parent_hash != empty_hash) {
      target_project_hash = current_project.parent_hash;
    }
    
    // Проверяем разрешение конвертации в целевой проект
    auto target_project = Capital::Projects::get_project_or_fail(coopname, target_project_hash);
    eosio::check(target_project.can_convert_to_project, 
                 "Конвертация в кошелек проекта запрещена для данного проекта");
    
    auto check_appendix = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, target_project_hash, username);
  
    // Создаем или обновляем кошелек целевого проекта с долями участника
    Capital::Wallets::upsert_project_wallet(coopname, target_project_hash, username, project_amount);
    
    Capital::Projects::add_project_membership_shares(coopname, target_project_hash, project_amount);
    Capital::Projects::add_project_converted_funds(coopname, target_project_hash, project_amount);
  }
  
  // Удаляем сегмент после конвертации
  Capital::Segments::remove_segment(coopname, project_hash, username);
  
}

// Конвертация реализована с учетом погашенного долга:
// - В проект: только базовые суммы всех ролей (creator_base + author_base + coordinator_base + investor_base + property_base)
// - В кошелек: (creator_base + author_base + coordinator_base) - debt_amount, не больше provisional_amount
// - В капитализацию: все взносы минус погашенный долг минус конвертированные в проект и кошелек
// - total_segment_available = total_segment_cost - debt_amount (долг уже погашен в pushrslt)
// - Долг погашается только за счет базовых сумм создателя/автора/координатора