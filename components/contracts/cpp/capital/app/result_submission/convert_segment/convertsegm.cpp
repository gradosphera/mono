/**

*
 * @brief Конвертирует сегмент участника в различные типы кошельков
 * Конвертирует сегмент участника в кошелек, капитал и кошелек проекта:
 * - Проверяет статус сегмента (должен быть contributed)
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
  eosio::check(segment.status == Capital::Segments::Status::CONTRIBUTED, 
               "Результат не внесён. Сначала внесите результат через pushrslt");
  
  // Проверяем актуальность сегмента (включая синхронизацию с инвестициями)
  Capital::Segments::check_segment_is_updated(coopname, project_hash, username,
    "Сегмент не обновлен. Выполните rfrshsegment перед конвертацией");
  
  // === ФАЗА 1: БАЗОВЫЕ ПРОВЕРКИ ===
  Wallet::validate_asset(wallet_amount);
  Wallet::validate_asset(capital_amount);
  Wallet::validate_asset(project_amount);
  
  // Проверяем, что у пользователя есть что конвертировать
  eosio::check(segment.total_segment_cost.amount > 0, 
               "У участника нет средств для конвертации (общая стоимость сегмента равна нулю)");
  
  // === ФАЗА 2: РАСЧЕТ ДОСТУПНЫХ СУММ ===
  
  // Проверяем что долг уже был погашен после pushrslt
  eosio::check(segment.debt_settled >= segment.debt_amount, 
               "Долг не был погашен. Сначала внесите результат через pushrslt");
  
  // Суммы доступные для конвертации в проект (все базовые суммы всех ролей)
  eosio::asset available_for_project = segment.creator_base + segment.author_base + 
                                      segment.coordinator_base + segment.investor_base + segment.property_base;
  
  // Суммы доступные для конвертации в кошелек (только creator_base + author_base + coordinator_base)
  // уменьшенные на погашенный долг, но не больше provisional_amount
  eosio::asset base_for_wallet = segment.creator_base + segment.author_base + segment.coordinator_base;
  eosio::asset wallet_base_after_debt = base_for_wallet - segment.debt_amount;
  
  // Долг не может превышать базовые суммы создателя/автора/координатора
  eosio::check(wallet_base_after_debt.amount >= 0, 
               "Долг превышает базовые суммы создателя/автора/координатора");
  
  eosio::asset available_for_wallet = (wallet_base_after_debt < segment.provisional_amount) ? 
                                     wallet_base_after_debt : segment.provisional_amount;
  
  // Все взносы должны конвертироваться в капитализацию, если не идут в проект или кошелек
  // Вычитаем погашенный долг из общей стоимости сегмента
  eosio::asset total_segment_available = segment.total_segment_cost - segment.debt_amount;
  
  // === ФАЗА 3: ПРОВЕРКИ ОГРАНИЧЕНИЙ ПО НАПРАВЛЕНИЯМ ===
  
  // Проверка 3.1: Ограничения конвертации в проект
  eosio::check(project_amount <= available_for_project, 
               "Сумма конвертации в проект превышает доступные базовые суммы всех ролей (creator_base + author_base + coordinator_base + investor_base + property_base)");
  
  // Проверка 3.2: Ограничения конвертации в кошелек
  eosio::check(wallet_amount <= available_for_wallet, 
               "Сумма конвертации в кошелек превышает доступные суммы (только creator_base + author_base + coordinator_base и не больше provisional_amount)");
  
  // Проверка 3.3: Ограничения конвертации в капитализацию
  eosio::asset total_convert = wallet_amount + capital_amount + project_amount;
  eosio::check(capital_amount == (total_segment_available - wallet_amount - project_amount), 
               "Сумма конвертации в капитал должна равняться: total_segment_cost - wallet_amount - project_amount");
  
  // === ФАЗА 4: ФИНАЛЬНАЯ ПРОВЕРКА ===
  // Проверяем что общая сумма конвертации соответствует всем взносам сегмента
  eosio::check(total_convert == total_segment_available, 
               "Общая сумма конвертации должна равняться общей стоимости сегмента (total_segment_cost)");
  
  Wallet::sub_blocked_funds(_capital, coopname, username, total_convert - project_amount, _source_program, 
                             Capital::Memo::get_convert_segment_to_wallet_memo(convert_hash));
    
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
    
    // Создаем или обновляем кошелек целевого проекта с долями участника
    Capital::Wallets::upsert_project_wallet(coopname, target_project_hash, username, project_amount);
    
    // Добавляем сконвертированные средства в глобальный пул программных инвестиций
    Capital::Core::add_program_investment_funds(coopname, project_amount);
    
    Capital::Projects::add_project_membership_shares(coopname, target_project_hash, project_amount);
    Capital::Projects::add_project_converted_funds(coopname, target_project_hash, project_amount);
  }
  
  // Обновляем сегмент (включая конвертированные суммы)
  Capital::Segments::update_segment_conversion(coopname, project_hash, username, 
                                            wallet_amount, capital_amount, project_amount);
  
}

// Конвертация реализована с учетом погашенного долга:
// - В проект: только базовые суммы всех ролей (creator_base + author_base + coordinator_base + investor_base + property_base)
// - В кошелек: (creator_base + author_base + coordinator_base) - debt_amount, не больше provisional_amount
// - В капитализацию: все взносы минус погашенный долг минус конвертированные в проект и кошелек
// - total_segment_available = total_segment_cost - debt_amount (долг уже погашен в pushrslt)
// - Долг погашается только за счет базовых сумм создателя/автора/координатора