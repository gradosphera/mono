#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include "../../entities/projects.hpp"
#include "../../entities/circle.hpp"

using namespace eosio;

namespace Capital::Core::Voting {

    /**
     * @brief Инициализирует голосование по проекту при его завершении
     * @param coopname Имя кооператива
     * @param project_hash Хэш проекта
     */
    void initialize_project_voting(name coopname, checksum256 project_hash);

    /**
     * @brief Рассчитывает все суммы для голосования по пулам
     */
    voting_amounts calculate_voting_amounts(const eosio::asset& authors_bonus_pool, 
                                           const eosio::asset& creators_bonus_pool,
                                           uint64_t total_author_shares,
                                           uint32_t total_voters,
                                           double authors_voting_percent = 38.2,
                                           double creators_voting_percent = 38.2);


    /**
     * @brief Рассчитывает итоговые суммы для участника по методу Водянова
     * @param coopname Имя кооператива
     * @param project_hash Хэш проекта
     * @param participant Имя участника
     * @return Итоговая сумма от голосования
     */
    eosio::asset calculate_voting_final_amount(name coopname, checksum256 project_hash, name participant);

    /**
     * @brief Рассчитывает равную премию автора
     * @param project Проект с данными голосования
     * @param segment Сегмент участника
     * @return Сумма равной премии автора
     */
    eosio::asset calculate_equal_author_bonus(const Capital::project& project, const Capital::Circle::segment& segment);

    /**
     * @brief Рассчитывает прямую премию создателя
     * @param project Проект с данными голосования
     * @param segment Сегмент участника
     * @return Сумма прямой премии создателя
     */
    eosio::asset calculate_direct_creator_bonus(const Capital::project& project, const Capital::Circle::segment& segment);

    /**
     * @brief Проверяет, завершено ли голосование (кто-то проголосовал или истек срок)
     * @param project Проект с данными голосования
     * @return true если голосование завершено
     */
    bool is_voting_completed(const Capital::project& project);

} // namespace Capital::Core