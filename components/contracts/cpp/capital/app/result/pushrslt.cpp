void capital::pushrslt(name coopname, name application, checksum256 project_hash, checksum256 result_hash, 
                        eosio::asset contribution_amount, eosio::asset debt_amount, document2 statement) {
  require_auth(application);

  // Проверяем заявление
  verify_document_or_fail(statement);

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
  Capital::Segments::check_segment_is_updated(coopname, project_hash, application,
    "Сегмент не обновлен. Выполните rfrshsegment перед внесением результата");

  // Проверяем сегмент участника и его статус
  auto segment = Capital::Segments::get_segment_or_fail(coopname, project_hash, application, "Сегмент участника не найден");
  eosio::check(segment.status == Capital::Segments::Status::READY, "Участник уже подавал результат или результат уже принят");
  eosio::check(segment.total_segment_cost.amount > 0, "У участника нет вкладов для приема результата");

  // Проверяем сумму долга в сегменте  
  eosio::check(debt_amount == segment.debt_amount, "Сумма долга не соответствует долгу в сегменте");
     
  // Получаем обновленный сегмент
  segment = Capital::Segments::get_segment_or_fail(coopname, project_hash, application, "Сегмент участника не найден");
  
  // Проверяем, что сумма взноса равна общей стоимости сегмента
  eosio::check(contribution_amount == segment.total_segment_cost, "Сумма взноса должна равняться общей стоимости сегмента");

  // Если есть долг, проверяем что взнос достаточен для его покрытия
  if (segment.debt_amount.amount > 0) {
    eosio::check(contribution_amount >= segment.debt_amount, 
                 "Сумма взноса должна быть >= суммы долга");
  }

  // Рассчитываем базовую сумму после погашения долга
  eosio::asset available_base_after_pay_debt = segment.total_segment_base_cost - segment.debt_amount;

  // Создаем объект результата
  Capital::Results::create_result_for_participant(coopname, project_hash, application, result_hash, contribution_amount, debt_amount, statement);

  // Выполняем операции с балансами если есть долг
  if (debt_amount.amount > 0) {
    //TODO: погасить долг на контракте loans
  }

  // Обновляем сегмент после принятия результата и пересчитываем доли - объединенная операция
  // для избежания двойного обновления одной записи
  Capital::Segments::update_segment_after_result_contribution_with_shares(coopname, project_hash, application, application, 
                                                                       available_base_after_pay_debt, debt_amount);

  // Обновляем накопительные показатели контрибьютора на основе его ролей в сегменте
  Capital::Contributors::update_contributor_ratings_from_segment(coopname, segment);
}
