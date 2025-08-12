void capital::returnunused(name coopname, name application, checksum256 project_hash, name username) {
  check_auth_or_fail(_capital, coopname, application, "returnunused"_n);

  // Проверяем, что проект закрыт
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  eosio::check(project.status == Capital::Projects::Status::CLOSED, "Проект должен быть закрыт");

  // Получаем сегмент инвестора
  auto segment = Capital::Segments::get_segment_or_fail(coopname, project_hash, username, "Сегмент инвестора не найден");
  eosio::check(segment.is_investor, "Пользователь не является инвестором проекта");

  // Рассчитываем неиспользованную сумму
  eosio::check(segment.investor_base <= segment.investor_amount, "Ошибка: использованная сумма больше инвестированной");
  eosio::asset unused_amount = segment.investor_amount - segment.investor_base;
  eosio::check(unused_amount.amount > 0, "Нет неиспользованных средств для возврата");

  // Получаем информацию о contributor для возврата средств
  auto contributor = Capital::Contributors::get_active_contributor_or_fail(coopname, username);
  
  std::string memo = Capital::Memo::get_return_unused_investments_memo();

  // Разблокируем неиспользованные средства и возвращаем в кошелек программы
  Wallet::sub_blocked_funds(_capital, coopname, username, unused_amount, _source_program, memo);
  Wallet::add_available_funds(_capital, coopname, username, unused_amount, _wallet_program, memo);
  
  // Обновляем проект - увеличиваем сумму возвращенных инвестиций
  Capital::project_index projects(_capital, coopname.value);
  auto project_itr = projects.find(project.id);
  
  projects.modify(project_itr, application, [&](auto &p) {
    p.fact.total_returned_investments += unused_amount;
  });

  // Обновляем сегмент - отмечаем что неиспользованные средства возвращены
  Capital::Segments::segments_index segments(_capital, coopname.value);
  auto segment_itr = segments.find(segment.id);
  
  segments.modify(segment_itr, application, [&](auto &s) {
    // Обновляем общую сумму инвестора до фактически использованной
    s.investor_amount = s.investor_base;
  });
}