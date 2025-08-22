/**
 * @brief Завершение голосования для конкретного участника по методу Водянова
 * Рассчитывает полные итоговые суммы участника включая:
 * - Результаты голосования по Водянову: (сумма голосов + средняя сумма распределения) / количество голосующих
 * - Фиксированные распределения: 61.8% авторских премий равно между авторами, 61.8% создательских премий прямо создателям
 * Обновляет сегмент участника с итоговыми суммами раздельно по пулам
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя-участника голосования
 * @param project_hash Хеш проекта для которого завершается голосование
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_calcvotes
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::calcvotes(name coopname, name username, checksum256 project_hash) {
    require_auth(coopname);
    
    // Получаем проект и проверяем состояние
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    eosio::check(project.status == Capital::Projects::Status::COMPLETED, "Проект не в статусе завершенного голосования");
    
    eosio::check(Capital::Core::Voting::is_voting_completed(project), "Голосование еще не завершено");
    eosio::check(Capital::Segments::is_voting_participant(coopname, project_hash, username), "Пользователь не является участником голосования");
    
    // Получаем сегмент участника
    auto segment = Capital::Segments::get_segment_or_fail(coopname, project_hash, username, "Сегмент участника не найден");
    
    // Рассчитываем все суммы через Core функции
    auto vodyanov_amount = Capital::Core::Voting::calculate_voting_final_amount(coopname, project_hash, username);
    auto equal_author_amount = Capital::Core::Voting::calculate_equal_author_bonus(project, segment);
    auto direct_creator_amount = Capital::Core::Voting::calculate_direct_creator_bonus(project, segment);
    
    // Обновляем сегмент участника
    Capital::Segments::update_segment_voting_results(coopname, project_hash, username,
                                                   vodyanov_amount, equal_author_amount, direct_creator_amount);
} 