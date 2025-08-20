/**
 * @brief Конвертирует сегмент участника в различные типы кошельков
 * Конвертирует сегмент участника в кошелек, капитал и кошелек проекта:
 * - Проверяет статус сегмента (должен быть contributed)
 * - Валидирует актуальность сегмента
 * - Проверяет наличие средств для конвертации
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
 * @anchor capital_convertsegm
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
  
  Wallet::validate_asset(wallet_amount);
  Wallet::validate_asset(capital_amount);
  Wallet::validate_asset(project_amount);
  
  // Проверяем, что у пользователя есть что конвертировать
  eosio::asset total_available = segment.available_base_after_pay_debt + segment.total_segment_bonus_cost;
  eosio::check(total_available.amount > 0, 
               "У участника нет средств для конвертации (базовая сумма после долга и бонусы равны нулю)");
  
  // Рассчитываем базовую сумму без имущественных взносов (они не могут конвертироваться в кошелек)
  eosio::asset base_without_property = segment.creator_base + segment.author_base + 
                                      segment.coordinator_base + segment.investor_base;
  eosio::asset available_for_wallet_project = base_without_property - segment.debt_amount;
  
  // Проверяем, что общая сумма конвертации в кошелек и проект не превышает доступную сумму из инвестиций
  eosio::asset total_wallet_project = wallet_amount + project_amount;
  eosio::check(total_wallet_project <= segment.provisional_amount,
               "Общая сумма конвертации в кошелек и проект превышает доступную сумму из инвестиционных средств проекта");
  
  // 1. Общая сумма конвертации в кошелек и проект не должна превышать базовую сумму БЕЗ имущественных взносов
  eosio::check(total_wallet_project <= available_for_wallet_project, 
               "Общая сумма конвертации в кошелек и проект превышает доступную базовую стоимость (имущественные взносы не могут идти в кошелек)");
  
  // 2. Проверяем что capital_amount рассчитан правильно
  // В капитализацию: ВСЕ бонусы + остаток базовой стоимости (не сконвертированный в кошелек и проект)
  eosio::asset remaining_base = segment.available_base_after_pay_debt - total_wallet_project;
  eosio::asset expected_capital = segment.total_segment_bonus_cost + remaining_base;
  eosio::check(capital_amount == expected_capital, 
               "Сумма конвертации в капитал должна равняться: все бонусы + остаток доступной базовой стоимости");
  
  // 3. Проверяем что общая сумма конвертации соответствует доступным средствам
  eosio::asset total_convert = wallet_amount + capital_amount + project_amount;
  eosio::check(total_convert == total_available, 
               "Общая сумма конвертации должна равняться всем доступным средствам участника");
  
  
  // Выполняем операции с балансами
  if (wallet_amount.amount > 0) {
    // Конвертация в кошелек

    Wallet::sub_blocked_funds(_capital, coopname, username, wallet_amount, _source_program, 
                             Capital::Memo::get_convert_segment_to_wallet_memo(convert_hash));
    Wallet::add_available_funds(_capital, coopname, username, wallet_amount, _wallet_program,
                               Capital::Memo::get_convert_segment_to_wallet_memo(convert_hash));
  }
  
  if (capital_amount.amount > 0) {
    // Конвертация в капитал
    Wallet::sub_blocked_funds(_capital, coopname, username, capital_amount, _source_program,
                             Capital::Memo::get_convert_segment_to_capital_memo(convert_hash));
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
    
    // Конвертация в кошелек проекта - создаем или обновляем кошелек проекта
    Wallet::sub_blocked_funds(_capital, coopname, username, project_amount, _source_program,
                             Capital::Memo::get_convert_segment_to_project_wallet_memo(convert_hash));
    
    // Создаем или обновляем кошелек целевого проекта с долями участника
    Capital::upsert_project_wallet(coopname, target_project_hash, username, project_amount);
    
    // Добавляем сконвертированные средства в глобальный пул программных инвестиций
    Capital::Core::add_program_investment_funds(coopname, project_amount);
    
    Capital::Projects::add_project_membership_shares(coopname, target_project_hash, project_amount);
    Capital::Projects::add_project_converted_funds(coopname, target_project_hash, project_amount);
  }
  
  // Обновляем сегмент (включая конвертированные суммы)
  Capital::Segments::update_segment_conversion(coopname, project_hash, username, 
                                            wallet_amount, capital_amount, project_amount);
  
  
  // Уменьшаем общие доли проекта на сумму конвертации в кошелек и капитал (но НЕ в кошелек проекта)
  eosio::asset project_shares_reduction = wallet_amount + capital_amount;
  Capital::Projects::subtract_project_shares(coopname, project_hash, project_shares_reduction);
  
}

// Конвертация в кошелек реализована с учетом ограничений по инвестиционным средствам через provisional_amount