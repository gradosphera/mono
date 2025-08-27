/**
 * @brief Вносит результат участника в проект
 * Вносит результат участника в завершенный проект с обработкой долгов и обновлением долей:
 * - Проверяет подлинность заявления о результате
 * - Валидирует входные параметры (суммы взноса и долга)
 * - Проверяет завершенность проекта и актуальность сегмента
 * - Валидирует сегмент участника и его статус
 * - Проверяет соответствие сумм взноса и долга
 * - Создает объект результата
 * - Обновляет сегмент после принятия результата и пересчитывает доли
 * - Обновляет накопительные показатели контрибьютора
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-участника
 * @param project_hash Хеш проекта
 * @param result_hash Хеш результата
 * @param contribution_amount Сумма взноса в результат
 * @param debt_amount Сумма долга для погашения
 * @param statement Заявление о результате
 * @param debt_hashes Вектор хэшей долгов для погашения (опционально)
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::pushrslt(name coopname, name username, checksum256 project_hash, checksum256 result_hash,
                        eosio::asset contribution_amount, eosio::asset debt_amount, document2 statement,
                        std::vector<checksum256> debt_hashes = {}) {
  require_auth(coopname);

  // Проверяем заявление
  verify_document_or_fail(statement, {username});

  // Валидация входных параметров
  Wallet::validate_asset(contribution_amount);
  Wallet::validate_asset(debt_amount);

  // Проверяем, что результат с таким хэшем не существует
  auto existing_result = Capital::Results::get_result(coopname, result_hash);
  eosio::check(!existing_result.has_value(), "Результат с таким хэшем уже существует");

  // Проверяем, что проект завершен
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  eosio::check(project.status == Capital::Projects::Status::COMPLETED, "Проект должен быть завершен");
  
  // Проверяем актуальность сегмента (включая синхронизацию с инвестициями)
  Capital::Segments::check_segment_is_updated(coopname, project_hash, username,
    "Сегмент не обновлен. Выполните rfrshsegment перед внесением результата");

  // Проверяем сегмент участника и его статус
  auto segment = Capital::Segments::get_segment_or_fail(coopname, project_hash, username, "Сегмент участника не найден");
  eosio::check(segment.status == Capital::Segments::Status::GENERATION, "Участник уже подавал результат или результат уже принят");
  eosio::check(segment.total_segment_cost.amount > 0, "У участника нет вкладов для приема результата");
  eosio::check(segment.username == username, "Неверный участник");

  // Проверяем сумму долга в сегменте  
  eosio::check(debt_amount == segment.debt_amount, "Сумма долга не соответствует долгу в сегменте");
     
  // Получаем обновленный сегмент
  segment = Capital::Segments::get_segment_or_fail(coopname, project_hash, username, "Сегмент участника не найден");
  
  // Проверяем, что сумма взноса равна общей стоимости сегмента
  eosio::check(contribution_amount == segment.total_segment_cost, "Сумма взноса должна равняться общей стоимости сегмента");

  // Если есть долг, проверяем что взнос достаточен для его покрытия
  if (segment.debt_amount.amount > 0) {
    eosio::check(contribution_amount >= segment.debt_amount, 
                 "Сумма взноса должна быть >= суммы долга");
  }

  // Создаем объект результата
  Capital::Results::create_result_for_participant(coopname, project_hash, username, result_hash, contribution_amount, debt_amount, statement);

  // Выполняем операции с балансами если есть долг
  if (debt_amount.amount > 0) {
    // Проверяем что переданы хэши долгов если есть сумма долга
    eosio::check(!debt_hashes.empty(), "Необходимо передать хэши долгов для погашения");

    // Проверяем что количество хэшей долгов не превышает разумный лимит (10)
    eosio::check(debt_hashes.size() <= 10, "Количество долгов для погашения не должно превышать 10");

    eosio::asset total_debt_to_settle = eosio::asset(0, debt_amount.symbol);

    // Гасим каждый долг из списка
    for (const auto& debt_hash : debt_hashes) {
      // Получаем информацию о долге
      auto debt = Capital::Debts::get_debt_or_fail(coopname, debt_hash);

      // Проверяем что долг принадлежит пользователю
      eosio::check(debt.username == username, "Долг не принадлежит указанному пользователю");

      // Проверяем что долг связан с этим проектом
      eosio::check(debt.project_hash == project_hash, "Долг не связан с указанным проектом");

      // Проверяем что долг в статусе 'paid' (выплачен пользователю, готов к погашению)
      eosio::check(debt.status == Capital::Debts::Status::PAID, "Долг должен быть в статусе 'paid' для погашения через внесение результата");

      // Удаляем долг после погашения
      Capital::Debts::delete_debt(coopname, debt_hash);

      // Суммируем общую сумму погашенных долгов
      total_debt_to_settle += debt.amount;
    }
    print("total_debt_to_settle: ", total_debt_to_settle.amount);
    print("debt_amount: ", debt_amount.amount);
    // Проверяем что общая сумма погашенных долгов соответствует заявленной сумме долга
    eosio::check(total_debt_to_settle == debt_amount,
                 "Общая сумма погашенных долгов не соответствует заявленной сумме долга");

    // Погашаем долг контрибьютора
    Capital::Contributors::decrease_debt_amount(coopname, username, debt_amount);
  } else {
    // Если нет долга, проверяем что вектор debt_hashes пустой
    eosio::check(debt_hashes.empty(), "Если нет суммы долга, вектор хэшей долгов должен быть пустым");
  }

  // Обновляем сегмент после принятия результата и пересчитываем доли - объединенная операция
  // для избежания двойного обновления одной записи
  Capital::Segments::update_segment_after_result_contribution_with_shares(coopname, project_hash, username,
                                                                       debt_amount);

  // Обновляем накопительные показатели контрибьютора на основе его ролей в сегменте
  Capital::Contributors::update_contributor_ratings_from_segment(coopname, segment);
}
