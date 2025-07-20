#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;

struct bonus_result {
    asset author_base;
    asset creator_base;
    asset creators_bonus;
    asset authors_bonus;
    asset generated;
    asset capitalists_bonus;
    asset total;
    
    // Новые поля для распределения по методу Водянова
    asset authors_direct_bonus;        // 68.2% от authors_bonus - прямое распределение поровну между авторами
    asset authors_vodyanov_bonus;      // 31.8% от authors_bonus - распределение по методу Водянова
    asset creators_direct_bonus;       // 68.2% от creators_bonus - идет создателю напрямую
    asset creators_vodyanov_bonus;     // 31.8% от creators_bonus - распределение по методу Водянова
    asset total_vodyanov_amount;       // Общая сумма для распределения по методу Водянова
};

// creauthors.hpp (или в capital.hpp)
struct [[eosio::table, eosio::contract(CAPITAL)]] creauthor {
    uint64_t    id;
    checksum256 project_hash;        // С каким результатом связана запись
    checksum256 assignment_hash;        // С каким результатом связана запись
    eosio::name username;           // 
    eosio::asset provisional_amount = asset(0, _root_govern_symbol);
    eosio::asset debt_amount = asset(0, _root_govern_symbol);
    eosio::asset spended = asset(0, _root_govern_symbol);    
    eosio::asset available = asset(0, _root_govern_symbol);
    eosio::asset for_convert = asset(0, _root_govern_symbol);
    
    // Сколько пользователь имеет «авторских долей» в этом результате
    uint64_t author_shares = 0;
    
    // Сколько пользователь имеет «создательских долей» в creators_bonus
    uint64_t creator_bonus_shares = 0;
    
    // Сколько часов вложено в задание
    uint64_t contributed_hours = 0;
    
    uint64_t primary_key() const { return id; }
    
    checksum256 by_assignment_hash() const { return assignment_hash; } ///< Индекс по хэшу задания
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта
  
    // Индекс по (assignment_hash + username)
    uint128_t by_resuser() const {
        return combine_checksum_ids(assignment_hash, username);
    }
};

typedef eosio::multi_index<
    "creauthors"_n, creauthor,
    indexed_by<"byproject"_n, const_mem_fun<creauthor, checksum256, &creauthor::by_project_hash>>,
    indexed_by<"byassignment"_n, const_mem_fun<creauthor, checksum256, &creauthor::by_assignment_hash>>,
    indexed_by<"byresuser"_n, const_mem_fun<creauthor, uint128_t, &creauthor::by_resuser>>
> creauthor_index;



struct [[eosio::table, eosio::contract(CAPITAL)]] expense {
  uint64_t id;                                 ///< Уникальный идентификатор действия.
  name coopname;                               ///< Имя кооператива.
  name application;                            ///< Приложение, инициировавшее расход.
  name username;                               ///< Имя пользователя, создавшего расход.
  
  name status = "created"_n;                   ///< Статус расхода (created | approved | authorized)
  checksum256 project_hash;                    ///< Хэш проекта, связанного с расходом.
  checksum256 assignment_hash;                     ///< Хэш задания, связанного с расходом.
  checksum256 expense_hash;                    ///< Хэш расхода.
  uint64_t fund_id;                            ///< Идентификатор фонда списания (expfunds в контакте fund)
  eosio::asset amount;                         ///< Сумма расхода.
  std::string description;                     ///< Публичное описание расхода. 

  document2 expense_statement;                          ///< Служебная записка
  document2 approved_statement;                 ///< принятая записка председателем или доверенным
  document2 authorization;                      ///< утвержденная записка советом
                                  
  time_point_sec spended_at = current_time_point();  ///< Дата и время создания расхода.

  uint64_t primary_key() const { return id; } ///< Основной ключ.
  uint64_t by_username() const { return username.value; } ///< По имени пользователя.
  checksum256 by_expense_hash() const { return expense_hash; } ///< Индекс по хэшу задачи.
  checksum256 by_assignment_hash() const { return assignment_hash; } ///< Индекс по хэшу задания.
  checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта.

};

  typedef eosio::multi_index<
    "expenses"_n, expense,
    indexed_by<"byusername"_n, const_mem_fun<expense, uint64_t, &expense::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<expense, checksum256, &expense::by_expense_hash>>,
    indexed_by<"byassignment"_n, const_mem_fun<expense, checksum256, &expense::by_assignment_hash>>,
    indexed_by<"byprojhash"_n, const_mem_fun<expense, checksum256, &expense::by_project_hash>>
  > expense_index;


/**
  * @brief Структура действий, хранящая данные о выполненных операциях.
  * \ingroup public_tables
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] commit {
    uint64_t id;                                 ///< Уникальный идентификатор действия.
    name coopname;                               ///< Имя кооператива.
    name application;                            ///< Приложение, инициировавшее действие.
    name username;                               ///< Имя пользователя, совершившего действие.
    name status;                                 ///< Статус коммита (created | approved | authorized | act1 | act2 )
    checksum256 project_hash;                    ///< Хэш проекта, связанного с действием.
    checksum256 assignment_hash;                     ///< Хэш задания, связанного с действием.
    checksum256 commit_hash;                     ///< Хэш действия.
    uint64_t contributed_hours;              ///< Сумма временных затрат, связанная с действием.
    eosio::asset rate_per_hour = asset(0, _root_govern_symbol); ///< Стоимость часа
    eosio::asset spended = asset(0, _root_govern_symbol); ///< Сумма затрат, связанная с действием.
    eosio::asset generated = asset(0, _root_govern_symbol); ///< Сумма генерации, связанная с действием.
    eosio::asset creators_bonus = asset(0, _root_govern_symbol); ///< Сумма затрат, связанная с действием.
    eosio::asset authors_bonus = asset(0, _root_govern_symbol);///< Сумма затрат, связанная с действием.
    eosio::asset capitalists_bonus = asset(0, _root_govern_symbol); ///< Сумма затрат, связанная с действием.
    eosio::asset total = asset(0, _root_govern_symbol); ///< Суммарная стоимость коммита на будущем приёме задания с учетом капитализации и генерации
    
    std::string decline_comment;
    time_point_sec created_at;                   ///< Дата и время создания действия.

    uint64_t primary_key() const { return id; } ///< Основной ключ.
    uint64_t by_username() const { return username.value; } ///< По имени пользователя.
    checksum256 by_commit_hash() const { return commit_hash; } ///< Индекс по хэшу задачи.
    checksum256 by_assignment_hash() const { return assignment_hash; } ///< Индекс по хэшу задания.
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта.
};

typedef eosio::multi_index<
    "commits"_n, commit,
    indexed_by<"byusername"_n, const_mem_fun<commit, uint64_t, &commit::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<commit, checksum256, &commit::by_commit_hash>>,
    indexed_by<"byassignment"_n, const_mem_fun<commit, checksum256, &commit::by_assignment_hash>>,
    indexed_by<"byprojhash"_n, const_mem_fun<commit, checksum256, &commit::by_project_hash>>
> commit_index;


/**
  * @brief Структура инвестиций, хранящая данные о вложениях в проекты.
  * \ingroup public_tables
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] invest {
    uint64_t id;                                ///< Уникальный идентификатор инвестиции.
    name coopname;                              ///< Имя аккаунта кооператива.
    name application;                           ///< Имя аккаунта приложения.
    name username;                              ///< Имя аккаунта инвестора.
    checksum256 invest_hash;                           ///< Хэш идентификатор объекта инвестиции.
    checksum256 project_hash;                   ///< Хэш идентификатора проекта.    
    eosio::asset amount = asset(0, _root_govern_symbol); ///< Сумма инвестиции.
    name status;                                ///< created | signed | authorized | blocked
    time_point_sec invested_at;                 ///< Дата приёма инвестиции.
    document2 invest_statement;                         ///< Заявление на зачёт из кошелька.
    document2 approved_statement;              ///< Подпись председателя на принятом заявлении.
    
    // Координатор, который привел инвестора (согласно ТЗ БЛАГОРОСТ v0.1)
    eosio::name coordinator_username;           ///< Имя координатора, который привел инвестора
    
    uint64_t primary_key() const { return id; } ///< Основной ключ.
    uint64_t by_username() const { return username.value; } ///< Индекс по имени аккаунта.
    checksum256 by_project() const { return project_hash; } ///< Индекс по проекту.
    checksum256 by_hash() const { return invest_hash; } ///< Индекс по хэшу.
    uint128_t by_project_user() const { return combine_checksum_ids(project_hash, username); } ///< Комбинированный индекс.
    uint64_t by_coordinator() const { return coordinator_username.value; } ///< Индекс по координатору.
};

typedef eosio::multi_index<
    "invests"_n, invest,
    indexed_by<"byhash"_n, const_mem_fun<invest, checksum256, &invest::by_hash>>,
    indexed_by<"byusername"_n, const_mem_fun<invest, uint64_t, &invest::by_username>>,
    indexed_by<"byproject"_n, const_mem_fun<invest, checksum256, &invest::by_project>>,
    indexed_by<"byprojuser"_n, const_mem_fun<invest, uint128_t, &invest::by_project_user>>,
    indexed_by<"bycoordntr"_n, const_mem_fun<invest, uint64_t, &invest::by_coordinator>>
> invest_index; ///< Таблица для хранения инвестиций.


/**
  * @brief Структура участника, хранящая данные индивидуального участника.
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] contributor {
    uint64_t id;
    name coopname;
    name username;
    checksum256 project_hash;
    name status;
    time_point_sec created_at;
    document2 agreement;
    document2 approved_agreement;
    document2 authorization;

    eosio::asset invested = asset(0, _root_govern_symbol);
    
    uint64_t convert_percent;
    uint64_t contributed_hours;
    
    eosio::asset rate_per_hour = asset(0, _root_govern_symbol); ///< Ставка пайщика за час
    
    eosio::asset spended = asset(0, _root_govern_symbol);
    eosio::asset debt_amount = asset(0, _root_govern_symbol);
    
    eosio::asset withdrawed = asset(0, _root_govern_symbol);
    eosio::asset converted = asset(0, _root_govern_symbol);
    eosio::asset expensed = asset(0, _root_govern_symbol);
    eosio::asset returned = asset(0, _root_govern_symbol);
    
    eosio::asset share_balance = asset(0, _root_govern_symbol); ///< Баланс долей пайщика
    eosio::asset pending_rewards = asset(0, _root_govern_symbol); ///< Накопленные награды
    int64_t reward_per_share_last = 0; ///< Последний зафиксированный cumulative_reward_per_share по проекту

    uint64_t primary_key() const { return id; }
    uint64_t by_username() const { return username.value; }
    checksum256 by_project() const { return project_hash; }
    uint128_t by_project_user() const { return combine_checksum_ids(project_hash, username); }
};

typedef eosio::multi_index<
    "contributors"_n, contributor,
    indexed_by<"byusername"_n, const_mem_fun<contributor, uint64_t, &contributor::by_username>>,
    indexed_by<"byproject"_n, const_mem_fun<contributor, checksum256, &contributor::by_project>>,
    indexed_by<"byprojuser"_n, const_mem_fun<contributor, uint128_t, &contributor::by_project_user>>
> contributor_index;


/**
  * @brief Таблица проектов
  * 
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] project {
    uint64_t id;
    checksum256 project_hash;
    checksum256 parent_project_hash;
    name coopname;
    name application;
    eosio::name status = "created"_n; ///< created
    
    std::string title;
    std::string description;
    std::string terms;
    std::string subject;
    
    uint64_t authors_count;
    uint64_t authors_shares;
    uint64_t commits_count;

    std::vector<uint64_t> expense_funds = {4}; 
    
    eosio::asset target = asset(0, _root_govern_symbol);
    eosio::asset invested = asset(0, _root_govern_symbol);
    eosio::asset available = asset(0, _root_govern_symbol);
    eosio::asset allocated = asset(0, _root_govern_symbol);
    
    eosio::asset creators_base = asset(0, _root_govern_symbol);
    eosio::asset creators_bonus = asset(0, _root_govern_symbol);
    eosio::asset authors_bonus = asset(0, _root_govern_symbol);
    eosio::asset capitalists_bonus = asset(0, _root_govern_symbol);
    eosio::asset total = asset(0, _root_govern_symbol); // стоимость проекта с учетом генерации и капитализации
    
    eosio::asset expensed = asset(0, _root_govern_symbol);
    eosio::asset spended = asset(0, _root_govern_symbol);
    eosio::asset generated = asset(0, _root_govern_symbol);
    eosio::asset converted = asset(0, _root_govern_symbol);
    eosio::asset withdrawed = asset(0, _root_govern_symbol);
    
    double parent_distribution_ratio = 1;  
    int64_t membership_cumulative_reward_per_share = 0; 
    
    eosio::asset total_share_balance = asset(0, _root_govern_symbol); ///< Общее количество долей пайщиков в проекте
    eosio::asset membership_funded = asset(0, _root_govern_symbol);       ///< Общее количество поступивших членских взносов 
    eosio::asset membership_available = asset(0, _root_govern_symbol);    ///< Доступное количество членских взносов для участников проекта согласно долям
    eosio::asset membership_distributed = asset(0, _root_govern_symbol); ///< Распределенное количество членских взносов на участников проекта
        
    time_point_sec created_at = current_time_point();
    
    uint64_t primary_key() const { return id; }
    uint64_t by_created_at() const { return created_at.sec_since_epoch(); }
    checksum256 by_hash() const { return project_hash; }
};

typedef eosio::multi_index<"projects"_n, project,
  indexed_by<"bycreatedat"_n, const_mem_fun<project, uint64_t, &project::by_created_at>>,
  indexed_by<"byhash"_n, const_mem_fun<project, checksum256, &project::by_hash>>
> project_index;


struct [[eosio::table, eosio::contract(CAPITAL)]] assignment {
    uint64_t id;
    checksum256 assignment_hash;
    checksum256 project_hash;
    eosio::name status = "opened"_n; ///< opened | closed

    eosio::name coopname;
    eosio::name assignee;
    eosio::name master;                          ///< Мастер задания согласно ТЗ
    std::string description;

    // Оценки мастера согласно ТЗ БЛАГОРОСТ v0.1
    uint64_t plan_time = 0;                      ///< Прогноз часовых затрат (план часов)
    eosio::asset plan_expense = asset(0, _root_govern_symbol); ///< Дополнительные расходы  
    
    // Расчётные поля согласно ТЗ
    eosio::asset creator_base_plan = asset(0, _root_govern_symbol); ///< plan_time * norma_hour_cost
    eosio::asset author_base_plan = asset(0, _root_govern_symbol);  ///< 61.8% * creator_base_plan
    eosio::asset coordinator_base_plan = asset(0, _root_govern_symbol); ///< (creator_base + author_base) / (100% - 4%)
    eosio::asset invest_plan = asset(0, _root_govern_symbol);       ///< общий план инвестиций

    uint64_t authors_shares;
    uint64_t total_creators_bonus_shares;

    uint64_t authors_count;
    uint64_t commits_count;
    time_point_sec created_at = current_time_point();
    time_point_sec expired_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + 365 * 86400);
    
    eosio::asset allocated = asset(0, _root_govern_symbol); ///< аллоцированные на создание задания средства
    eosio::asset available = asset(0, _root_govern_symbol); ///< зарезерированные на создание задания средства
    eosio::asset spended = asset(0, _root_govern_symbol); ///< фактически потраченные ресурсы на создание задание в виде времени (паевые взносы-возвраты)
    eosio::asset generated = asset(0, _root_govern_symbol); ///< стоимость РИД с учётом премий авторов и создателей
    eosio::asset expensed = asset(0, _root_govern_symbol); ///< фактически потраченные на создание задания средства в виде расходов (подписки, прочее)
    eosio::asset withdrawed = asset(0, _root_govern_symbol); ///< фактически возвращенные средства из задания
    
    eosio::asset creators_base = asset(0, _root_govern_symbol); ///< себестоимость РИД
    
    eosio::asset creators_bonus = asset(0, _root_govern_symbol); ///< премии создателей - 0.382 от себестоимости (creators_base)
    eosio::asset authors_bonus = asset(0, _root_govern_symbol);  ///< премии авторов - 1.618 от себестоимости (creators_base)
    eosio::asset capitalists_bonus = asset(0, _root_govern_symbol); ///< премии пайщиков кооператива - 1.618 от generated_amount
    
    eosio::asset total = asset(0, _root_govern_symbol); ///< Стоимость РИД с учетом генерации и капитализации (стоимость РИД в spended + authors_bonus + creators_bonus + capitalists_bonus)
    
    eosio::asset authors_bonus_remain = asset(0, _root_govern_symbol); ///< сумма остатка для выплаты авторам
    eosio::asset creators_base_remain = asset(0, _root_govern_symbol); ///< сумма остатка для выплаты авторам
    
    eosio::asset creators_bonus_remain = asset(0, _root_govern_symbol); ///< сумма остатка для выплаты авторам
        
    eosio::asset capitalists_bonus_remain = asset(0, _root_govern_symbol); ///< сумма остатка для выплаты пайщикам
    
    uint64_t primary_key() const { return id; }     ///< Основной ключ.
    checksum256 by_hash() const { return assignment_hash; } ///< Индекс по хэшу задания.
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу идеи    
};

  typedef eosio::multi_index<"assignments"_n, assignment,
    indexed_by<"byhash"_n, const_mem_fun<assignment, checksum256, &assignment::by_hash>>,
    indexed_by<"byprojecthash"_n, const_mem_fun<assignment, checksum256, &assignment::by_project_hash>>
  > assignment_index;



struct [[eosio::table, eosio::contract(CAPITAL)]] result {
    uint64_t id;
    checksum256 project_hash;
    checksum256 assignment_hash;
    checksum256 result_hash;
    
    eosio::name coopname;
    eosio::name username;

    eosio::name type; ///< intellectual | property
    eosio::name status = "created"_n; ///< created | statement | decision | act1 | act2 | completed
    time_point_sec created_at = current_time_point();

    eosio::asset creator_base_amount = asset(0, _root_govern_symbol);
    eosio::asset debt_amount = asset(0, _root_govern_symbol);
    
    eosio::asset creator_bonus_amount = asset(0, _root_govern_symbol);
    eosio::asset author_bonus_amount = asset(0, _root_govern_symbol);
    eosio::asset generation_amount = asset(0, _root_govern_symbol);
    eosio::asset capitalist_bonus_amount = asset(0, _root_govern_symbol);
    
    eosio::asset total_amount = asset(0, _root_govern_symbol);
    eosio::asset available_for_return = asset(0, _root_govern_symbol);
    eosio::asset available_for_convert = asset(0, _root_govern_symbol);
        
    document2 result_statement; ///< Заявление
    document2 approved_statement; ///< Принятое заявление
    document2 authorization; ///< Решение совета
    document2 act1; ///< Акт1
    document2 act2; ///< Акт2
    
    uint64_t primary_key() const { return id; }     ///< Основной ключ.
    uint64_t by_username() const { return username.value; } ///< Индекс по владельцу
    checksum256 by_hash() const { return result_hash; } ///< Индекс по хэшу проекта
    
    checksum256 by_assignment_hash() const { return assignment_hash; } ///< Индекс по хэшу
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта
    
    uint128_t by_assignment_user() const {
        return combine_checksum_ids(assignment_hash, username);
    }
};

  typedef eosio::multi_index<"results"_n, result,
    indexed_by<"byusername"_n, const_mem_fun<result, uint64_t, &result::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<result, checksum256, &result::by_hash>>,
    indexed_by<"byassignment"_n, const_mem_fun<result, checksum256, &result::by_assignment_hash>>,
    indexed_by<"byprojecthash"_n, const_mem_fun<result, checksum256, &result::by_project_hash>>,
    indexed_by<"byresuser"_n, const_mem_fun<result, uint128_t, &result::by_assignment_user>>
  > result_index;



struct [[eosio::table, eosio::contract(CAPITAL)]] convert {
    uint64_t id;
    checksum256 project_hash;
    checksum256 assignment_hash;
    checksum256 convert_hash;
    
    eosio::name coopname;
    eosio::name username;

    eosio::name status = "created"_n; ///< created

    eosio::asset convert_amount = asset(0, _root_govern_symbol);

    document2 convert_statement; ///< Заявление

    time_point_sec created_at = current_time_point();
    
    uint64_t primary_key() const { return id; }     ///< Основной ключ.
    uint64_t by_username() const { return username.value; } ///< Индекс по владельцу
    checksum256 by_convert_hash() const { return convert_hash; } ///< Индекс по хэшу
    checksum256 by_assignment_hash() const { return assignment_hash; } ///< Индекс по хэшу
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта
    
    uint128_t by_assignment_user() const {
        return combine_checksum_ids(assignment_hash, username);
    }
};

  typedef eosio::multi_index<"converts"_n, convert,
    indexed_by<"byusername"_n, const_mem_fun<convert, uint64_t, &convert::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<convert, checksum256, &convert::by_convert_hash>>,
    indexed_by<"byassignment"_n, const_mem_fun<convert, checksum256, &convert::by_assignment_hash>>,
    indexed_by<"byprojecthash"_n, const_mem_fun<convert, checksum256, &convert::by_project_hash>>
  > convert_index;


struct [[eosio::table, eosio::contract(CAPITAL)]] author {
    uint64_t id;
    checksum256 project_hash;
    eosio::name username;
    uint64_t shares;
    
    uint64_t primary_key() const { return id; } ///< Основной ключ
    uint64_t by_username() const { return username.value; } ///< Индекс по имени пользователя
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу идеи
    
    uint128_t by_project_author() const {
        return combine_checksum_ids(project_hash, username);
    }
};

  typedef eosio::multi_index<"authors"_n, author,
    indexed_by<"byusername"_n, const_mem_fun<author, uint64_t, &author::by_username>>,
    indexed_by<"byprojecthash"_n, const_mem_fun<author, checksum256, &author::by_project_hash>>,
    indexed_by<"byprojauthor"_n, const_mem_fun<author, uint128_t, &author::by_project_author>>
  > authors_index;



struct [[eosio::table, eosio::contract(CAPITAL)]] creator {
  uint64_t id; ///< id и primary_key
  
  checksum256 project_hash; ///< Хэш идеи
  checksum256 assignment_hash; ///< Хэш задания интеллектуальной деятельности
  
  eosio::name username; ///< Имя пользователя
  eosio::asset spended = asset(0, _root_govern_symbol); ///< Стоимость использованных ресурсов

  uint64_t primary_key() const { return id; }
  checksum256 by_assignment_hash() const { return assignment_hash; }
  checksum256 by_project_hash() const { return project_hash; }
  
  uint128_t by_assignment_creator() const {
        return combine_checksum_ids(assignment_hash, username);
    }
    
  uint64_t by_username() const { return username.value; }
};

  typedef eosio::multi_index<"creators"_n, creator,
    indexed_by<"byassignment"_n, const_mem_fun<creator, checksum256, &creator::by_assignment_hash>>,
    indexed_by<"byprojecthash"_n, const_mem_fun<creator, checksum256, &creator::by_project_hash>>,
    indexed_by<"byusername"_n, const_mem_fun<creator, uint64_t, &creator::by_username>>,
    indexed_by<"byassigncrtr"_n, const_mem_fun<creator, uint128_t, &creator::by_assignment_creator>>
  > creators_index;

/**
  * @brief Структура координатора согласно ТЗ БЛАГОРОСТ v0.1
  * Координатор получает 4% от инвестиций, которые он привел
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] coordinator {
    uint64_t id;
    checksum256 project_hash;                    ///< Хэш проекта
    eosio::name username;                        ///< Имя координатора
    eosio::name status = "active"_n;             ///< Статус координатора (active | completed)
    
    // Накопленные суммы от приведенных инвестиций (до момента сдачи результата)
    eosio::asset pending_coordinator_base = asset(0, _root_govern_symbol); ///< Накопленная сумма 4% от приведенных инвестиций
    
    // Фактически начисленные суммы (после сдачи результата и предоставления презентации)
    eosio::asset coordinator_base = asset(0, _root_govern_symbol); ///< Себестоимость координатора (фактически начисленная)
    eosio::asset earned = asset(0, _root_govern_symbol);           ///< Заработанная сумма
    eosio::asset withdrawed = asset(0, _root_govern_symbol);       ///< Выведенная сумма
    
    // Общие накопления по всем приведенным инвесторам (для контроля лимитов)
    eosio::asset total_accumulated_all_investors = asset(0, _root_govern_symbol); ///< Общая сумма накоплений по всем инвесторам
    
    time_point_sec assigned_at = current_time_point();            ///< Дата назначения
    
    uint64_t primary_key() const { return id; }
    uint64_t by_username() const { return username.value; }
    checksum256 by_project_hash() const { return project_hash; }
    
    uint128_t by_project_coordinator() const {
        return combine_checksum_ids(project_hash, username);
    }
};

typedef eosio::multi_index<"coordinators"_n, coordinator,
    indexed_by<"byusername"_n, const_mem_fun<coordinator, uint64_t, &coordinator::by_username>>,
    indexed_by<"byprojecthash"_n, const_mem_fun<coordinator, checksum256, &coordinator::by_project_hash>>,
    indexed_by<"byprojcoord"_n, const_mem_fun<coordinator, uint128_t, &coordinator::by_project_coordinator>>
> coordinator_index;

/**
  * @brief Таблица для отслеживания выплат координаторам за приведенных инвесторов
  * Гарантирует что координатор получает не более 100,000 RUB за каждого инвестора
  * и только до первой подачи презентации об этом инвесторе
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] coordinator_payout {
    uint64_t id;
    eosio::name coordinator_username;            ///< Имя координатора
    eosio::name investor_username;               ///< Имя инвестора, за которого получена выплата
    checksum256 result_hash;                     ///< Хэш результата, в котором была подана презентация
    eosio::asset total_accumulated = asset(0, _root_govern_symbol); ///< Общая накопленная сумма за инвестора
    eosio::asset amount_claimed = asset(0, _root_govern_symbol);     ///< Сумма, полученная при подаче презентации
    time_point_sec claimed_at = current_time_point();               ///< Дата получения вознаграждения
    
    uint64_t primary_key() const { return id; }
    uint64_t by_coordinator() const { return coordinator_username.value; }
    uint64_t by_investor() const { return investor_username.value; }
    checksum256 by_result() const { return result_hash; }
    
    uint128_t by_coordinator_investor() const {
      return combine_ids(coordinator_username.value, investor_username.value);
    }
};

typedef eosio::multi_index<"coordpayouts"_n, coordinator_payout,
    indexed_by<"bycoordntr"_n, const_mem_fun<coordinator_payout, uint64_t, &coordinator_payout::by_coordinator>>,
    indexed_by<"byinvestor"_n, const_mem_fun<coordinator_payout, uint64_t, &coordinator_payout::by_investor>>,
    indexed_by<"byresult"_n, const_mem_fun<coordinator_payout, checksum256, &coordinator_payout::by_result>>,
    indexed_by<"bycoordinv"_n, const_mem_fun<coordinator_payout, uint128_t, &coordinator_payout::by_coordinator_investor>>
> coordinator_payout_index;

/**
  * @brief Структура мастера задания согласно ТЗ БЛАГОРОСТ v0.1  
  * Мастер организует производство историй по заданию и принимает коммиты создателей
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] master {
    uint64_t id;
    checksum256 project_hash;                    ///< Хэш проекта
    checksum256 assignment_hash;                 ///< Хэш задания (опционально, если мастер конкретного задания)
    eosio::name username;                        ///< Имя мастера
    eosio::name role = "project"_n;              ///< Роль: project (мастер проекта) | assignment (мастер задания)
    eosio::name status = "active"_n;             ///< Статус мастера (active | completed)
    
    // Оценки от мастера согласно ТЗ
    uint64_t plan_time = 0;                      ///< Прогноз часовых затрат (план часов)
    eosio::asset plan_expense = asset(0, _root_govern_symbol); ///< Дополнительные расходы
    
    time_point_sec assigned_at = current_time_point(); ///< Дата назначения
    
    uint64_t primary_key() const { return id; }
    uint64_t by_username() const { return username.value; }
    checksum256 by_project_hash() const { return project_hash; }
    checksum256 by_assignment_hash() const { return assignment_hash; }
    
    uint128_t by_project_master() const {
        return combine_checksum_ids(project_hash, username);
    }
    
    uint128_t by_assignment_master() const {
        return combine_checksum_ids(assignment_hash, username);
    }
};

typedef eosio::multi_index<"masters"_n, master,
    indexed_by<"byusername"_n, const_mem_fun<master, uint64_t, &master::by_username>>,
    indexed_by<"byprojecthash"_n, const_mem_fun<master, checksum256, &master::by_project_hash>>,
    indexed_by<"byassignment"_n, const_mem_fun<master, checksum256, &master::by_assignment_hash>>,
    indexed_by<"byprojmaster"_n, const_mem_fun<master, uint128_t, &master::by_project_master>>,
    indexed_by<"byassignmstr"_n, const_mem_fun<master, uint128_t, &master::by_assignment_master>>
> master_index;

/**
  * @brief Структура глобального состояния, хранящая общие данные контракта.
  * \ingroup public_tables
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] global_state {
    eosio::name coopname;                                ///< Имя кооператива глобального состояния.
    uint64_t program_id;                                  ///<  Идентификатор целевой программы.
    
    asset program_membership_funded = asset(0, _root_govern_symbol); ///< Общая сумма членских взносов по программе
    asset program_membership_available = asset(0, _root_govern_symbol); ///< Доступная сумма членских взносов по программе
    asset program_membership_distributed = asset(0, _root_govern_symbol); ///< Распределенная сумма членских взносов по программе
    int64_t program_membership_cumulative_reward_per_share;               ///< Накопительное вознаграждение на долю в членских взносах
    
        
    asset total_shares = asset(0, _root_govern_symbol);    ///< Общая сумма долей всех участников.
    asset total_contributions = asset(0, _root_govern_symbol); ///< Общая сумма всех вкладов.
    asset total_rewards_distributed = asset(0, _root_symbol); ///< Общая сумма распределенных вознаграждений.
    asset total_withdrawed = asset(0, _root_symbol); ///< Общая сумма, выведенная через withdraw1.
    asset total_intellectual_contributions = asset(0, _root_govern_symbol); ///< Общая сумма интеллектуальных вкладов.
    asset total_property_contributions = asset(0, _root_govern_symbol); ///< Общая сумма имущественных вкладов.
    asset accumulated_amount = asset(0, _root_symbol); ///< Накопленные членские взносы.
    int64_t cumulative_reward_per_share = 0;        ///< Накопленное вознаграждение на долю (масштабировано).

    uint64_t primary_key() const { return coopname.value; }     ///< Основной ключ.
};

  typedef eosio::multi_index<"state"_n, global_state> global_state_table; ///< Таблица для хранения глобального состояния.


namespace capital_tables {
  struct [[eosio::table, eosio::contract(CAPITAL)]] capitalist {
    name username;                        ///< Имя пользователя
    name coopname;                        ///< Имя кооператива
    asset pending_rewards = asset(0, _root_govern_symbol);  ///< Вознаграждения ожидающие получения
    asset returned_rewards = asset(0, _root_govern_symbol); ///< Полученные вознаграждения
    int64_t reward_per_share_last;        ///< Крайнее вознаграждение за долю

    uint64_t primary_key() const { return username.value; }             ///< Основной ключ.
  };

  typedef eosio::multi_index<"capitalists"_n, capitalist> capitalist_index; ///< Таблица для хранения участников программы капитализации
  
  
  struct [[eosio::table, eosio::contract(CAPITAL)]] result_withdraw {
      uint64_t id;                                ///< Уникальный ID запроса на возврат.
      name coopname;                              ///< Имя аккаунта кооператива
      checksum256 project_hash;                    ///< Хэш проекта
      checksum256 assignment_hash;                    ///< Хэш задания
      checksum256 withdraw_hash;                  ///< Уникальный внешний ключ
      name username;                              ///< Имя аккаунта участника, запрашивающего возврат.
      name status = "created"_n;                  ///< Статус взноса-возврата (created | approved | )
      asset amount = asset(0, _root_govern_symbol);      ///< Запрошенная сумма для возврата.
      document2 contribution_statement;            ///< Заявление на паевой взнос авторскими правами           
      document2 return_statement;                  ///< Заявление на возврат паевого взноса деньгами
      
      document2 approved_contribution_statement;   ///< Принятое председателем заявление на взнос
      document2 approved_return_statement;         ///< Принятое председателем заявление на возврат взноса деньгами
      
      document2 authorized_contribution_statement; ///< Решение совета на приём взноса
      document2 authorized_return_statement;       ///< Решение совета на возврат взноса
      
      time_point_sec created_at = current_time_point();                   ///< Дата и время создания действия.                       ///< Время создания запроса.
      
      uint64_t primary_key() const { return id; }             ///< Основной ключ.
      uint64_t by_account() const { return username.value; }   ///< Вторичный индекс по аккаунту.
      uint64_t by_created() const { return created_at.sec_since_epoch(); }
      checksum256 by_hash() const { return withdraw_hash; } ///< Индекс по хэшу
  };

    typedef eosio::multi_index<"reswithdraws"_n, result_withdraw,
      indexed_by<"byhash"_n, const_mem_fun<result_withdraw, checksum256, &result_withdraw::by_hash>>,
      indexed_by<"byusername"_n, const_mem_fun<result_withdraw, uint64_t, &result_withdraw::by_account>>,
      indexed_by<"bycreated"_n, const_mem_fun<result_withdraw, uint64_t, &result_withdraw::by_created>>
    > result_withdraws_index; ///< Таблица для хранения запросов на возврат из задания.

  
  struct [[eosio::table, eosio::contract(CAPITAL)]] project_withdraw {
      uint64_t id;                                ///< Уникальный ID запроса на возврат.
      name coopname;                              ///< Имя аккаунта кооператива
      checksum256 project_hash;                    ///< Хэш проекта
      checksum256 withdraw_hash;                  ///< Уникальный внешний ключ
      name username;                              ///< Имя аккаунта участника, запрашивающего возврат.
      name status = "created"_n;                  ///< Статус взноса-возврата (created | approved | )
      asset amount = asset(0, _root_govern_symbol);      ///< Запрошенная сумма для возврата.
      document2 return_statement;                  ///< Заявление на возврат паевого взноса деньгами
      
      document2 approved_return_statement;         ///< Принятое председателем заявление на возврат взноса деньгами
      
      time_point_sec created_at = current_time_point();                   ///< Дата и время создания действия.                       ///< Время создания запроса.
      
      uint64_t primary_key() const { return id; }             ///< Основной ключ.
      uint64_t by_account() const { return username.value; }   ///< Вторичный индекс по аккаунту.
      uint64_t by_created() const { return created_at.sec_since_epoch(); }
      checksum256 by_hash() const { return withdraw_hash; } ///< Индекс по хэшу
      checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта
  };

    typedef eosio::multi_index<"prjwithdraws"_n, project_withdraw,
      indexed_by<"byhash"_n, const_mem_fun<project_withdraw, checksum256, &project_withdraw::by_hash>>,
      indexed_by<"byprojhash"_n, const_mem_fun<project_withdraw, checksum256, &project_withdraw::by_project_hash>>,
      indexed_by<"byusername"_n, const_mem_fun<project_withdraw, uint64_t, &project_withdraw::by_account>>,
      indexed_by<"bycreated"_n, const_mem_fun<project_withdraw, uint64_t, &project_withdraw::by_created>>
    > project_withdraws_index; ///< Таблица для хранения запросов на возврат из проекта.


  struct [[eosio::table, eosio::contract(CAPITAL)]] program_withdraw {
      uint64_t id;                                ///< Уникальный ID запроса на возврат.
      name coopname;                              ///< Имя аккаунта кооператива
      checksum256 withdraw_hash;                  ///< Уникальный внешний ключ
      name username;                              ///< Имя аккаунта участника, запрашивающего возврат.
      name status = "created"_n;                  ///< Статус взноса-возврата (created | approved | )
      asset amount = asset(0, _root_govern_symbol);      ///< Запрошенная сумма для возврата.
      document2 return_statement;                  ///< Заявление на возврат паевого взноса деньгами
      
      document2 approved_return_statement;         ///< Принятое председателем заявление на возврат взноса деньгами
      
      time_point_sec created_at = current_time_point();                   ///< Дата и время создания действия.                       ///< Время создания запроса.
      
      uint64_t primary_key() const { return id; }             ///< Основной ключ.
      uint64_t by_account() const { return username.value; }   ///< Вторичный индекс по аккаунту.
      uint64_t by_created() const { return created_at.sec_since_epoch(); }
      checksum256 by_hash() const { return withdraw_hash; } ///< Индекс по хэшу
  };

    typedef eosio::multi_index<"prgwithdraws"_n, program_withdraw,
      indexed_by<"byhash"_n, const_mem_fun<program_withdraw, checksum256, &program_withdraw::by_hash>>,
      indexed_by<"byusername"_n, const_mem_fun<program_withdraw, uint64_t, &program_withdraw::by_account>>,
      indexed_by<"bycreated"_n, const_mem_fun<program_withdraw, uint64_t, &program_withdraw::by_created>>
    > program_withdraws_index; ///< Таблица для хранения запросов на возврат из проекта.


/**
  * @brief Структура для распределения по методу Водянова
  * Хранит общую информацию о голосовании для конкретного результата
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] vodyanov_distribution {
    uint64_t id;
    checksum256 result_hash;                     ///< Хэш результата, для которого проводится голосование
    checksum256 assignment_hash;                 ///< Хэш задания
    eosio::name coopname;                        ///< Имя кооператива
    eosio::name status = "created"_n;            ///< Статус: created | voting | completed
    
    // Участники голосования (авторы + создатели)
    std::vector<eosio::name> participants;       ///< Список всех участников голосования
    uint32_t total_participants = 0;             ///< Общее количество участников
    uint32_t votes_received = 0;                 ///< Количество полученных голосов
    
    // Суммы для распределения
    eosio::asset total_amount = asset(0, _root_govern_symbol);           ///< Общая сумма к распределению (31.8% от премий)
    eosio::asset voting_amount = asset(0, _root_govern_symbol);          ///< Голосующая сумма = total_amount * (participants-1)/participants
    eosio::asset equal_share = asset(0, _root_govern_symbol);            ///< Равная доля = total_amount / participants
    
    time_point_sec created_at = current_time_point();
    time_point_sec voting_deadline = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + 7 * 86400); ///< 7 дней на голосование
    
    uint64_t primary_key() const { return id; }
    checksum256 by_result_hash() const { return result_hash; }
    checksum256 by_assignment_hash() const { return assignment_hash; }
    uint64_t by_coopname() const { return coopname.value; }
};

typedef eosio::multi_index<
    "vodyanovdist"_n, vodyanov_distribution,
    indexed_by<"byresult"_n, const_mem_fun<vodyanov_distribution, checksum256, &vodyanov_distribution::by_result_hash>>,
    indexed_by<"byassignment"_n, const_mem_fun<vodyanov_distribution, checksum256, &vodyanov_distribution::by_assignment_hash>>,
    indexed_by<"bycoopname"_n, const_mem_fun<vodyanov_distribution, uint64_t, &vodyanov_distribution::by_coopname>>
> vodyanov_distribution_index;


/**
  * @brief Структура для индивидуальных голосов по методу Водянова
  * Каждый участник распределяет voting_amount между остальными участниками
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] vodyanov_vote {
    uint64_t id;
    uint64_t distribution_id;                    ///< ID распределения, к которому относится голос
    checksum256 result_hash;                     ///< Хэш результата
    eosio::name voter;                           ///< Кто голосует
    eosio::name recipient;                       ///< Кому голосует
    eosio::asset amount = asset(0, _root_govern_symbol); ///< Сумма голоса
    
    time_point_sec voted_at = current_time_point();
    
    uint64_t primary_key() const { return id; }
    uint64_t by_distribution_id() const { return distribution_id; }
    uint64_t by_voter() const { return voter.value; }
    uint64_t by_recipient() const { return recipient.value; }
    checksum256 by_result_hash() const { return result_hash; }
    
    uint128_t by_voter_recipient() const {
        return combine_ids(voter.value, recipient.value);
    }
    
    uint128_t by_distribution_voter() const {
        return combine_ids(distribution_id, voter.value);
    }
};

typedef eosio::multi_index<
    "vodyanovvote"_n, vodyanov_vote,
    indexed_by<"bydistrib"_n, const_mem_fun<vodyanov_vote, uint64_t, &vodyanov_vote::by_distribution_id>>,
    indexed_by<"byvoter"_n, const_mem_fun<vodyanov_vote, uint64_t, &vodyanov_vote::by_voter>>,
    indexed_by<"byrecipient"_n, const_mem_fun<vodyanov_vote, uint64_t, &vodyanov_vote::by_recipient>>,
    indexed_by<"byresult"_n, const_mem_fun<vodyanov_vote, checksum256, &vodyanov_vote::by_result_hash>>,
    indexed_by<"byvoterrcpt"_n, const_mem_fun<vodyanov_vote, uint128_t, &vodyanov_vote::by_voter_recipient>>,
    indexed_by<"bydistvoter"_n, const_mem_fun<vodyanov_vote, uint128_t, &vodyanov_vote::by_distribution_voter>>
> vodyanov_vote_index;


/**
  * @brief Структура для хранения финальных результатов распределения по методу Водянова
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] vodyanov_result {
    uint64_t id;
    uint64_t distribution_id;                    ///< ID распределения
    checksum256 result_hash;                     ///< Хэш результата
    eosio::name participant;                     ///< Участник
    eosio::asset votes_received = asset(0, _root_govern_symbol); ///< Сумма полученных голосов от других
    eosio::asset equal_share = asset(0, _root_govern_symbol);    ///< Равная доля
    eosio::asset final_amount = asset(0, _root_govern_symbol);   ///< Итоговая сумма = votes_received + equal_share
    
    time_point_sec calculated_at = current_time_point();
    
    uint64_t primary_key() const { return id; }
    uint64_t by_distribution_id() const { return distribution_id; }
    uint64_t by_participant() const { return participant.value; }
    checksum256 by_result_hash() const { return result_hash; }
    
    uint128_t by_distribution_participant() const {
        return combine_ids(distribution_id, participant.value);
    }
};

typedef eosio::multi_index<
    "vodyanovrslt"_n, vodyanov_result,
    indexed_by<"bydistrib"_n, const_mem_fun<vodyanov_result, uint64_t, &vodyanov_result::by_distribution_id>>,
    indexed_by<"byparticip"_n, const_mem_fun<vodyanov_result, uint64_t, &vodyanov_result::by_participant>>,
    indexed_by<"byresult"_n, const_mem_fun<vodyanov_result, checksum256, &vodyanov_result::by_result_hash>>,
    indexed_by<"bydistpart"_n, const_mem_fun<vodyanov_result, uint128_t, &vodyanov_result::by_distribution_participant>>
> vodyanov_result_index;

}