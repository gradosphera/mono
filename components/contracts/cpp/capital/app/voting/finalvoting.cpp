#include "../../domain/core/voting.hpp"
#include "../../domain/entities/circle.hpp"

/**
 * @brief Завершение голосования для конкретного участника по методу Водянова
 * Рассчитывает полные итоговые суммы участника включая:
 * - Результаты голосования по Водянову: (сумма голосов + общая сумма распределения) / количество голосующих
 * - Фиксированные распределения: 61.8% авторских премий равно между авторами, 61.8% создательских премий прямо создателям
 * Обновляет сегмент участника с итоговыми суммами раздельно по пулам
 */
void capital::finalvodyanov(name coopname, name application, name username, checksum256 project_hash) {
    require_auth(application);
    
    // Получаем проект и проверяем состояние
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    eosio::check(project.status == Capital::Projects::Status::VOTING, "Проект не в статусе голосования");
    eosio::check(Capital::Core::is_voting_completed(project), "Голосование еще не завершено");
    eosio::check(Capital::Circle::is_voting_participant(coopname, project_hash, username), "Пользователь не является участником голосования");
    
    // Получаем сегмент участника
    auto segment = Capital::Circle::get_segment_or_fail(coopname, project_hash, username, "Сегмент участника не найден");
    
    // Рассчитываем все суммы через Core функции
    auto voting_amount = Capital::Core::Voting::calculate_voting_final_amount(coopname, project_hash, username);
    auto equal_author_amount = Capital::Core::Voting::calculate_equal_author_bonus(project, segment);
    auto direct_creator_amount = Capital::Core::Voting::calculate_direct_creator_bonus(project, segment);
    
    // Обновляем сегмент участника
    Capital::Circle::update_segment_voting_results(coopname, project_hash, username, application,
                                                   voting_amount, equal_author_amount, direct_creator_amount);
} 