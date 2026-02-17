/**

*
 * @brief Конвертирует сегмент участника в кошелек и программу капитализации
 * Конвертирует сегмент участника в кошелек и капитал:
 * - Проверяет статус сегмента: CONTRIBUTED (результат внесён через pushrslt)
 * - Валидирует актуальность сегмента
 * - Проверяет что долг уже погашен (если был)
 * - Проверяет наличие средств для конвертации (с учетом погашенного долга)
 * - Валидирует корректность сумм конвертации
 * - Выполняет операции с балансами (кошелек, капитал)
 * - Удаляет сегмент после конвертации
 * 
 * ВАЖНО: Чистые инвесторы не могут использовать convertsegm.
 * Для них используется отдельный метод purgesegment.
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
 * @param convert_statement Заявление о конвертации
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @note Авторизация требуется от аккаунта: @p coopname
 * @note Чистые инвесторы должны использовать метод purgesegment
 */
void capital::convertsegm(eosio::name coopname, eosio::name username,
                          checksum256 project_hash, checksum256 convert_hash, 
                          eosio::asset wallet_amount, eosio::asset capital_amount,
                          document2 convert_statement) {
  require_auth(coopname);
  
  // Получаем сегмент пайщика
  auto segment = Capital::Segments::get_segment_or_fail(coopname, project_hash, username, 
                                                      "Сегмент пайщика не найден");
  
  // Определяем целевой проект для конвертации
  auto current_project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
  // Проверяем что участник не является чистым инвестором
  // Чистые инвесторы не могут конвертировать сегмент через convertsegm
  // Для них используется отдельный метод purgesegment
  bool is_pure_inv = Capital::Segments::is_pure_investor(segment);
  eosio::check(!is_pure_inv, 
               "Чистые инвесторы не могут конвертировать сегмент. Используйте метод purgesegment для очистки сегмента");
  
  // Участники с интеллектуальными ролями должны сначала внести результат
  eosio::check(segment.status == Capital::Segments::Status::CONTRIBUTED, 
               "Результат не внесён. Сначала внесите результат через pushrslt");
  
  // Проверяем актуальность сегмента (включая синхронизацию с инвестициями)
  Capital::Core::check_segment_is_updated(coopname, current_project, segment, "Сегмент не обновлен. Выполните rfrshsegment перед конвертацией");
  
  // === ФАЗА 1: БАЗОВЫЕ ПРОВЕРКИ ===
  Wallet::validate_asset(wallet_amount);
  Wallet::validate_asset(capital_amount);
  
  // Доступная сумма для конвертации в кошелек (только из интеллектуальных вкладов)
  eosio::asset available_for_wallet = segment.provisional_amount - segment.debt_amount;
  eosio::check(wallet_amount <= available_for_wallet, "Сумма конвертации в кошелек превышает доступную и обеспеченную суммы. Для конвертации доступна обеспеченная сумма за вычетом суммы выданных ссуд (provisional_amount - debt_amount)");
  
  // Доступная сумма для конвертации в программу
  eosio::asset available_for_program = segment.available_for_program;
  
  // Проверяем что общая сумма конвертации равна доступной сумме
  eosio::asset total_convert = wallet_amount + capital_amount;
  
  eosio::check(total_convert == available_for_program, "Общая сумма конвертации должна равняться сумме всех себестоимостей и премий за вычетом суммы выданных ссуд. Передано: " + total_convert.to_string() + ", Ожидается: " + available_for_program.to_string());

  eosio::check(capital_amount <= available_for_program, "Сумма конвертации в программу превышает сумму себестоимости и премий за вычетом суммы выданных ссуд");
  eosio::check(capital_amount == (available_for_program - wallet_amount), "В программу должно быть сконвертировано всё доступное, что не конвертируется в кошелёк");

  
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
  // Добавляем всю часть интеллектуального вклада, направленную в капитал
  
  if (capital_amount.amount > 0) {
    // Конвертация неинвесторской части в капитал
    Wallet::add_blocked_funds(_capital, coopname, username, capital_amount, _capital_program,
                             Capital::Memo::get_convert_segment_to_capital_memo(convert_hash));
  }
  
  // Списываем средства с кошелька _source_program (только интеллектуальная часть, т.к. инвесторкая уже в _capital_program)
  if (segment.intellectual_cost.amount > 0) {
    Wallet::sub_blocked_funds(_capital, coopname, username, segment.intellectual_cost, _source_program, Capital::Memo::get_convert_segment_to_wallet_memo(convert_hash));
  }
  
  // Инкрементируем счётчик сконвертированных сегментов
  Capital::Projects::increment_converted_segments(coopname, current_project.id);
  
  // Удаляем сегмент после конвертации
  Capital::Segments::remove_segment(coopname, segment.id);
  
}

// Конвертация реализована с учетом того что investor_base уже в _capital_program:
// - В кошелек: provisional_amount - debt_amount, не больше available_for_wallet
// - В капитализацию: все взносы минус долг минус кошелек (investor_base уже там)
// - Для чистых инвесторов: используется отдельный метод purgesegment
// - total_segment_available = total_segment_cost - debt_amount (долг уже погашен в pushrslt)
// - Долг погашается только за счет базовых сумм создателя/автора/координатора