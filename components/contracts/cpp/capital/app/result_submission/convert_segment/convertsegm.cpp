/**

*
 * @brief Конвертирует сегмент участника в различные типы кошельков
 * Конвертирует сегмент участника в кошелек, капитал и кошелек проекта:
 * - Проверяет статус сегмента:
 *   * Для чистых инвесторов: READY или CONTRIBUTED (не требуется внесение через pushrslt)
 *   * Для участников с интеллектуальными ролями: CONTRIBUTED (результат внесён через pushrslt)
 * - Валидирует актуальность сегмента
 * - Проверяет что долг уже погашен (если был)
 * - Проверяет наличие средств для конвертации (с учетом погашенного долга)
 * - Валидирует корректность сумм конвертации
 * - Выполняет операции с балансами (кошелек, капитал, проект)
 * - Обновляет сегмент и доли проекта
 * 
 * Для чистых инвесторов: средства уже в _capital_program (благорост), конвертация не требует
 * перемещения средств - только зачистку сегмента.
 * 
 * Для участников со смешанными ролями (инвестор + другие): investor_base уже в _capital_program,
 * а интеллектуальные вклады в _source_program. Конвертация перемещает только неинвесторскую часть.
 * 
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
 * @note Чистые инвесторы могут конвертировать сегмент БЕЗ внесения результата через pushrslt
 */
void capital::convertsegm(eosio::name coopname, eosio::name username,
                          checksum256 project_hash, checksum256 convert_hash, 
                          eosio::asset wallet_amount, eosio::asset capital_amount, eosio::asset project_amount,
                          document2 convert_statement) {
  require_auth(coopname);
  
  // Получаем сегмент пайщика
  auto segment = Capital::Segments::get_segment_or_fail(coopname, project_hash, username, 
                                                      "Сегмент пайщика не найден");
  
  // Определяем целевой проект для конвертации
  auto current_project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
  // Проверяем статус сегмента
  // Чистые инвесторы могут конвертировать в статусе READY (они не вносят результат через pushrslt)
  // Все остальные должны внести результат (статус CONTRIBUTED)
  bool is_pure_inv = Capital::Segments::is_pure_investor(segment);
  
  if (is_pure_inv) {
    // Чистые инвесторы могут конвертировать уже в статусе READY
    eosio::check(segment.status == Capital::Segments::Status::READY || 
                 segment.status == Capital::Segments::Status::CONTRIBUTED,
                 "Чистые инвесторы могут конвертировать сегмент в статусе READY или CONTRIBUTED");
    
    // Чистые инвесторы не могут погашать долг через pushrslt, поэтому у них не должно быть долга
    eosio::check(segment.debt_amount.amount == 0, 
                 "Чистые инвесторы не могут иметь непогашенный долг. Сначала погасите долг.");
    
    // Чистый инвестор: средства уже в _capital_program, конвертация в кошелек и проект запрещена
    eosio::check(wallet_amount.amount == 0, "Чистые инвесторы не могут конвертировать средства в кошелек. Средства уже в программе благорост.");
    eosio::check(project_amount.amount == 0, "Чистые инвесторы не могут конвертировать средства в проект. Средства уже в программе благорост.");
    eosio::check(capital_amount == segment.investor_base, "Для чистого инвестора capital_amount должен равняться investor_base");
    
  } else {
    // Участники с интеллектуальными ролями должны сначала внести результат
    eosio::check(segment.status == Capital::Segments::Status::CONTRIBUTED, 
                 "Результат не внесён. Сначала внесите результат через pushrslt");
  }
  
  // Проверяем актуальность сегмента (включая синхронизацию с инвестициями)
  Capital::Core::check_segment_is_updated(coopname, current_project, segment, "Сегмент не обновлен. Выполните rfrshsegment перед конвертацией");
  
  // === ФАЗА 1: БАЗОВЫЕ ПРОВЕРКИ ===
  Wallet::validate_asset(wallet_amount);
  Wallet::validate_asset(capital_amount);
  Wallet::validate_asset(project_amount);
  
  // Доступная сумма для конвертации в кошелек (только из интеллектуальных вкладов)
  eosio::asset available_for_wallet = segment.provisional_amount - segment.debt_amount;
  eosio::check(wallet_amount <= available_for_wallet, "Сумма конвертации в кошелек превышает доступную и обеспеченную суммы. Для конвертации доступна обеспеченная сумма за вычетом суммы выданных ссуд (provisional_amount - debt_amount)");
  
  // Доступная сумма для конвертации в проект (без investor_base - он уже в _capital_program)
  eosio::asset available_for_project = segment.creator_base + segment.author_base + segment.coordinator_base + segment.property_base - segment.debt_amount;
  eosio::check(project_amount <= available_for_project, "Сумма конвертации в проект превышает себестоимость вкладов за вычетом суммы выданных ссуд (без инвестиционной части)");
  
  // Доступная сумма для конвертации в программу
  eosio::asset available_for_program = segment.total_segment_cost - segment.debt_amount;
  
  // Проверяем что общая сумма конвертации равна доступной сумме для конвертации в программу
  eosio::asset total_convert = wallet_amount + capital_amount + project_amount;
  
  eosio::check(total_convert == available_for_program, "Общая сумма конвертации должна равняться сумме всех себестоимостей и премий за вычетом суммы выданных ссуд");

  eosio::check(capital_amount <= available_for_program, "Сумма конвертации в программу превышает сумму себестоимости и премий за вычетом суммы выданных ссуд");
  eosio::check(capital_amount == (available_for_program - wallet_amount - project_amount), "В программу должно быть сконвертировано всё доступное, что не конвертируется в проект или кошелёк");

  
  if (project_amount.amount > 0) {
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
    
    Capital::Projects::add_project_membership_shares(coopname, target_project.id, project_amount);
    Capital::Projects::add_project_converted_funds(coopname, target_project.id, project_amount);
  }
  
  // Выполняем операции с балансами
  if (wallet_amount.amount > 0) {
    // Конвертация в кошелек (это использование инвестиций для компенсации)
    Wallet::add_available_funds(_capital, coopname, username, wallet_amount, _wallet_program,
                               Capital::Memo::get_convert_segment_to_wallet_memo(convert_hash));
    
    // Учитываем использование инвестиций для компенсации
    Capital::Projects::add_used_for_compensation(coopname, current_project.id, wallet_amount);
  }
  
  // Рассчитываем сумму, которую надо ДОБАВИТЬ в _capital_program
  // investor_base уже заблокирован в _capital_program при инвестировании (createinvest)
  // Добавляем только неинвесторскую часть, идущую в капитал
  eosio::asset new_capital_amount = capital_amount - segment.investor_base;
  
  if (new_capital_amount.amount > 0) {
    // Конвертация неинвесторской части в капитал
    Wallet::add_blocked_funds(_capital, coopname, username, new_capital_amount, _capital_program,
                             Capital::Memo::get_convert_segment_to_capital_memo(convert_hash));
  }
  
  // Списываем средства с кошелька _source_program (только неинвесторская часть)
  // investor_base НЕ в _source_program - он был напрямую заблокирован в _capital_program при инвестировании
  // В _source_program находятся только интеллектуальные вклады (от pushrslt/signact2)
  eosio::asset amount_to_sub_from_source = total_convert - project_amount - segment.investor_base;
  
  if (amount_to_sub_from_source.amount > 0) {
    Wallet::sub_blocked_funds(_capital, coopname, username, amount_to_sub_from_source, _source_program, Capital::Memo::get_convert_segment_to_wallet_memo(convert_hash));
  }
  
  // Инкрементируем счётчик сконвертированных сегментов
  Capital::Projects::increment_converted_segments(coopname, current_project.id);
  
  // Удаляем сегмент после конвертации
  Capital::Segments::remove_segment(coopname, segment.id);
  
}

// Конвертация реализована с учетом того что investor_base уже в _capital_program:
// - В проект: только неинвесторские базовые суммы (creator_base + author_base + coordinator_base + property_base)
// - В кошелек: provisional_amount - debt_amount, не больше available_for_wallet
// - В капитализацию: все взносы минус долг минус проект и кошелек (investor_base уже там)
// - Для чистых инвесторов: никаких перемещений средств, только зачистка сегмента
// - total_segment_available = total_segment_cost - debt_amount (долг уже погашен в pushrslt)
// - Долг погашается только за счет базовых сумм создателя/автора/координатора