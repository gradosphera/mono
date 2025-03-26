#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;

struct bonus_result {
    int64_t creators_bonus;
    int64_t authors_bonus;
    int64_t generated;
    int64_t capitalists_bonus;
    int64_t total;
};

// resactors.hpp (или в capital.hpp)
struct [[eosio::table, eosio::contract(CAPITAL)]] resactor {
    uint64_t    id;
    checksum256 project_hash;        // С каким результатом связана запись
    checksum256 result_hash;        // С каким результатом связана запись
    eosio::name username;           // Чей это учёт

    eosio::asset available = asset(0, _root_govern_symbol);
    eosio::asset for_convert = asset(0, _root_govern_symbol);
    eosio::asset spend = asset(0, _root_govern_symbol);    
    
    // Сколько пользователь имеет «авторских долей» в этом результате
    uint64_t authors_shares = 0;
    
    // Сколько пользователь имеет «создательских долей» в creators_bonus
    uint64_t creators_bonus_shares = 0;
    
    // Сколько часов вложено в результат
    uint64_t contributed_hours = 0;
    
    uint64_t primary_key() const { return id; }
    
    checksum256 by_result_hash() const { return result_hash; } ///< Индекс по хэшу результата
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта
  
    // Индекс по (result_hash + username)
    uint128_t by_resuser() const {
        return combine_checksum_ids(result_hash, username);
    }
};

typedef eosio::multi_index<
    "resactors"_n, resactor,
    indexed_by<"byproject"_n, const_mem_fun<resactor, checksum256, &resactor::by_project_hash>>,
    indexed_by<"byresult"_n, const_mem_fun<resactor, checksum256, &resactor::by_result_hash>>,
    indexed_by<"byresuser"_n, const_mem_fun<resactor, uint128_t, &resactor::by_resuser>>
> resactor_index;



struct [[eosio::table, eosio::contract(CAPITAL)]] expense {
  uint64_t id;                                 ///< Уникальный идентификатор действия.
  name coopname;                               ///< Имя кооператива.
  name application;                            ///< Приложение, инициировавшее расход.
  name username;                               ///< Имя пользователя, создавшего расход.
  
  name status = "created"_n;                   ///< Статус расхода (created | approved | authorized)
  checksum256 project_hash;                    ///< Хэш проекта, связанного с расходом.
  checksum256 result_hash;                     ///< Хэш результата, связанного с расходом.
  checksum256 expense_hash;                    ///< Хэш расхода.
  uint64_t fund_id;                            ///< Идентификатор фонда списания (expfunds в контакте fund)
  eosio::asset amount;                         ///< Сумма расхода.
  std::string description;                     ///< Публичное описание расхода. 

  document expense_statement;                          ///< Служебная записка
  document approved_statement;                 ///< принятая записка председателем или доверенным
  document authorization;                      ///< утвержденная записка советом
                                  
  time_point_sec spend_at = current_time_point();  ///< Дата и время создания расхода.

  uint64_t primary_key() const { return id; } ///< Основной ключ.
  uint64_t by_username() const { return username.value; } ///< По имени пользователя.
  checksum256 by_expense_hash() const { return expense_hash; } ///< Индекс по хэшу задачи.
  checksum256 by_result_hash() const { return result_hash; } ///< Индекс по хэшу результата.
  checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта.

};

  typedef eosio::multi_index<
    "expenses"_n, expense,
    indexed_by<"byusername"_n, const_mem_fun<expense, uint64_t, &expense::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<expense, checksum256, &expense::by_expense_hash>>,
    indexed_by<"byresulthash"_n, const_mem_fun<expense, checksum256, &expense::by_result_hash>>,
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
    checksum256 result_hash;                     ///< Хэш результата, связанного с действием.
    checksum256 commit_hash;                     ///< Хэш действия.
    uint64_t contributed_hours;              ///< Сумма временных затрат, связанная с действием.
    eosio::asset spend;                          ///< Сумма затрат, связанная с действием.
    
    document contribution_statement;                          ///< Техническое задание (спецификация) как приложение к договору УХД
    document approved_statement;                 ///< Одобрение председателя или доверенного лица
    document authorization;                          ///< Решение совета
    document act1;                                ///< акт приема-передачи (1)
    document act2;                                ///< акт приема-передачи (2)
    time_point_sec created_at;                   ///< Дата и время создания действия.

    uint64_t primary_key() const { return id; } ///< Основной ключ.
    uint64_t by_username() const { return username.value; } ///< По имени пользователя.
    checksum256 by_commit_hash() const { return commit_hash; } ///< Индекс по хэшу задачи.
    checksum256 by_result_hash() const { return result_hash; } ///< Индекс по хэшу результата.
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта.
};

typedef eosio::multi_index<
    "commits"_n, commit,
    indexed_by<"byusername"_n, const_mem_fun<commit, uint64_t, &commit::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<commit, checksum256, &commit::by_commit_hash>>,
    indexed_by<"byresulthash"_n, const_mem_fun<commit, checksum256, &commit::by_result_hash>>,
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
    document invest_statement;                         ///< Заявление на зачёт из кошелька.
    document approved_statement;              ///< Подпись председателя на принятом заявлении. 
    
    uint64_t primary_key() const { return id; } ///< Основной ключ.
    uint64_t by_username() const { return username.value; } ///< Индекс по имени аккаунта.
    checksum256 by_project() const { return project_hash; } ///< Индекс по проекту.
    checksum256 by_hash() const { return invest_hash; } ///< Индекс по хэшу.
    uint128_t by_project_user() const { return combine_checksum_ids(project_hash, username); } ///< Комбинированный индекс.
};

typedef eosio::multi_index<
    "invests"_n, invest,
    indexed_by<"byhash"_n, const_mem_fun<invest, checksum256, &invest::by_hash>>,
    indexed_by<"byusername"_n, const_mem_fun<invest, uint64_t, &invest::by_username>>,
    indexed_by<"byproject"_n, const_mem_fun<invest, checksum256, &invest::by_project>>,
    indexed_by<"byprojuser"_n, const_mem_fun<invest, uint128_t, &invest::by_project_user>>
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
    document agreement;
    document approved_agreement;
    document authorization;

    eosio::asset invested = asset(0, _root_govern_symbol);
    
    uint64_t convert_percent;
    uint64_t contributed_hours;
    
    eosio::asset rate_per_hour = asset(0, _root_govern_symbol);
    
    eosio::asset spend = asset(0, _root_govern_symbol);
    eosio::asset withdrawed = asset(0, _root_govern_symbol);
    eosio::asset converted = asset(0, _root_govern_symbol);
    eosio::asset expensed = asset(0, _root_govern_symbol);
    eosio::asset returned = asset(0, _root_govern_symbol);
    eosio::asset claimed = asset(0, _root_govern_symbol);
    
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
    std::vector<uint64_t> expense_funds = {4}; 
    
    eosio::asset target = asset(0, _root_govern_symbol);
    eosio::asset invested = asset(0, _root_govern_symbol);
    eosio::asset available = asset(0, _root_govern_symbol);
    eosio::asset allocated = asset(0, _root_govern_symbol);
    eosio::asset expensed = asset(0, _root_govern_symbol);
    eosio::asset spend = asset(0, _root_govern_symbol);
    eosio::asset generated = asset(0, _root_govern_symbol);
    eosio::asset converted = asset(0, _root_govern_symbol);
    eosio::asset claimed = asset(0, _root_govern_symbol);
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


struct [[eosio::table, eosio::contract(CAPITAL)]] result {
    uint64_t id;
    checksum256 result_hash;
    checksum256 project_hash;
    eosio::name status = "created"_n; ///< created
    
    eosio::name coopname;
    time_point_sec created_at = current_time_point();
    time_point_sec expired_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + 365 * 86400);
    uint64_t authors_shares;
    uint64_t total_creators_bonus_shares; 
    
    uint64_t authors_count;    
    uint64_t commits_count;
    
    eosio::asset allocated = asset(0, _root_govern_symbol); ///< аллоцированные на создание результата средства
    eosio::asset available = asset(0, _root_govern_symbol); ///< зарезерированные на создание результата средства
    eosio::asset spend = asset(0, _root_govern_symbol); ///< фактически потраченные ресурсы на создание результат в виде времени (паевые взносы-возвраты)
    eosio::asset expensed = asset(0, _root_govern_symbol); ///< фактически потраченные на создание результата средства в виде расходов (подписки, прочее)
    eosio::asset withdrawed = asset(0, _root_govern_symbol); ///< фактически возвращенные средства из результата
    
    eosio::asset creators_amount = asset(0, _root_govern_symbol); ///< себестоимость РИД
    eosio::asset generated_amount = asset(0, _root_govern_symbol); ///< стоимость РИД с учётом премий авторов и создателей
    
    eosio::asset creators_bonus = asset(0, _root_govern_symbol); ///< премии создателей - 0.382 от себестоимости (creators_amount)
    eosio::asset authors_bonus = asset(0, _root_govern_symbol);  ///< премии авторов - 1.618 от себестоимости (creators_amount)
    eosio::asset capitalists_bonus = asset(0, _root_govern_symbol); ///< премии пайщиков кооператива - 1.618 от generated_amount
    
    eosio::asset total_amount = asset(0, _root_govern_symbol); ///< Капитализация РИД  (стоимость РИД в generated_amount + capitalists_bonus)
    
    eosio::asset authors_bonus_remain = asset(0, _root_govern_symbol); ///< сумма остатка для выплаты авторам
    eosio::asset creators_amount_remain = asset(0, _root_govern_symbol); ///< сумма остатка для выплаты авторам
    
    eosio::asset creators_bonus_remain = asset(0, _root_govern_symbol); ///< сумма остатка для выплаты авторам
    
    
    eosio::asset capitalists_bonus_remain = asset(0, _root_govern_symbol); ///< сумма остатка для выплаты пайщикам
    
    uint64_t primary_key() const { return id; }     ///< Основной ключ.
    checksum256 by_hash() const { return result_hash; } ///< Индекс по хэшу результата.
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу идеи    
};

  typedef eosio::multi_index<"results"_n, result,
    indexed_by<"byhash"_n, const_mem_fun<result, checksum256, &result::by_hash>>,
    indexed_by<"byprojecthash"_n, const_mem_fun<result, checksum256, &result::by_project_hash>>
  > result_index;



struct [[eosio::table, eosio::contract(CAPITAL)]] claim {
    uint64_t id;
    checksum256 project_hash;
    checksum256 result_hash;
    
    eosio::name coopname;
    eosio::name username;

    eosio::name type; ///< intellectual | property
    eosio::name status = "created"_n; ///< created | statement | decision | act1 | act2 | completed
    time_point_sec created_at = current_time_point();

    eosio::asset author_amount = asset(0, _root_govern_symbol);
    eosio::asset creator_amount = asset(0, _root_govern_symbol);
    eosio::asset capitalist_amount = asset(0, _root_govern_symbol);

    eosio::asset total_amount = asset(0, _root_govern_symbol);
        
    document claim_statement; ///< Заявление
    document approved_statement; ///< Принятое заявление
    document authorization; ///< Решение
    
    uint64_t primary_key() const { return id; }     ///< Основной ключ.
    uint64_t by_username() const { return username.value; } ///< Индекс по владельцу
    checksum256 by_result_hash() const { return result_hash; } ///< Индекс по хэшу
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта
    
    uint128_t by_result_user() const {
        return combine_checksum_ids(result_hash, username);
    }
};

  typedef eosio::multi_index<"claims"_n, claim,
    indexed_by<"byusername"_n, const_mem_fun<claim, uint64_t, &claim::by_username>>,
    indexed_by<"byresult"_n, const_mem_fun<claim, checksum256, &claim::by_result_hash>>,
    indexed_by<"byprojecthash"_n, const_mem_fun<claim, checksum256, &claim::by_project_hash>>,
    indexed_by<"byresuser"_n, const_mem_fun<claim, uint128_t, &claim::by_result_user>>
  > claim_index;



struct [[eosio::table, eosio::contract(CAPITAL)]] convert {
    uint64_t id;
    checksum256 project_hash;
    checksum256 result_hash;
    checksum256 convert_hash;
    
    eosio::name coopname;
    eosio::name username;

    eosio::name status = "created"_n; ///< created

    eosio::asset convert_amount = asset(0, _root_govern_symbol);

    document convert_statement; ///< Заявление

    time_point_sec created_at = current_time_point();
    
    uint64_t primary_key() const { return id; }     ///< Основной ключ.
    uint64_t by_username() const { return username.value; } ///< Индекс по владельцу
    checksum256 by_convert_hash() const { return convert_hash; } ///< Индекс по хэшу
    checksum256 by_result_hash() const { return result_hash; } ///< Индекс по хэшу
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта
    
    uint128_t by_result_user() const {
        return combine_checksum_ids(result_hash, username);
    }
};

  typedef eosio::multi_index<"converts"_n, convert,
    indexed_by<"byusername"_n, const_mem_fun<convert, uint64_t, &convert::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<convert, checksum256, &convert::by_convert_hash>>,
    indexed_by<"byresult"_n, const_mem_fun<convert, checksum256, &convert::by_result_hash>>,
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


/**
 * @brief Таблица для учёта авторства на результатах
 * Принимает в себя копии объектов авторов из проекта. И используется для распределения премий по конкретному результату.
 */
struct [[eosio::table, eosio::contract(CAPITAL)]] result_author {
    uint64_t id;
    checksum256 project_hash;
    checksum256 result_hash;
    
    eosio::name username;
    
    uint64_t shares;
    
    uint64_t primary_key() const { return id; } ///< Основной ключ
    uint64_t by_username() const { return username.value; } ///< Индекс по имени пользователя
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу идеи
    
    uint128_t by_result_author() const {
        return combine_checksum_ids(project_hash, username);
    }
};

  typedef eosio::multi_index<"resauthors"_n, result_author,
    indexed_by<"byusername"_n, const_mem_fun<result_author, uint64_t, &result_author::by_username>>,
    indexed_by<"byprojecthash"_n, const_mem_fun<result_author, checksum256, &result_author::by_project_hash>>,
    indexed_by<"byresauthor"_n, const_mem_fun<result_author, uint128_t, &result_author::by_result_author>>
  > result_authors_index;


struct [[eosio::table, eosio::contract(CAPITAL)]] creator {
  uint64_t id; ///< id и primary_key
  
  checksum256 project_hash; ///< Хэш идеи
  checksum256 result_hash; ///< Хэш результата интеллектуальной деятельности
  
  eosio::name username; ///< Имя пользователя
  eosio::asset spend = asset(0, _root_govern_symbol); ///< Стоимость использованных ресурсов

  uint64_t primary_key() const { return id; }
  checksum256 by_result_hash() const { return result_hash; }
  checksum256 by_project_hash() const { return project_hash; }
  
  uint128_t by_result_creator() const {
        return combine_checksum_ids(result_hash, username);
    }
    
  uint64_t by_username() const { return username.value; }
};

  typedef eosio::multi_index<"creators"_n, creator,
    indexed_by<"byresulthash"_n, const_mem_fun<creator, checksum256, &creator::by_result_hash>>,
    indexed_by<"byprojecthash"_n, const_mem_fun<creator, checksum256, &creator::by_project_hash>>,
    indexed_by<"byusername"_n, const_mem_fun<creator, uint64_t, &creator::by_username>>,
    indexed_by<"byresultcrtr"_n, const_mem_fun<creator, uint128_t, &creator::by_result_creator>>
  > creators_index;

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
      checksum256 result_hash;                    ///< Хэш результата
      checksum256 withdraw_hash;                  ///< Уникальный внешний ключ
      name username;                              ///< Имя аккаунта участника, запрашивающего возврат.
      name status = "created"_n;                  ///< Статус взноса-возврата (created | approved | )
      asset amount = asset(0, _root_govern_symbol);      ///< Запрошенная сумма для возврата.
      document contribution_statement;            ///< Заявление на паевой взнос авторскими правами           
      document return_statement;                  ///< Заявление на возврат паевого взноса деньгами
      
      document approved_contribution_statement;   ///< Принятое председателем заявление на взнос
      document approved_return_statement;         ///< Принятое председателем заявление на возврат взноса деньгами
      
      document authorized_contribution_statement; ///< Решение совета на приём взноса
      document authorized_return_statement;       ///< Решение совета на возврат взноса
      
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
    > result_withdraws_index; ///< Таблица для хранения запросов на возврат из результата.

  
  struct [[eosio::table, eosio::contract(CAPITAL)]] project_withdraw {
      uint64_t id;                                ///< Уникальный ID запроса на возврат.
      name coopname;                              ///< Имя аккаунта кооператива
      checksum256 project_hash;                    ///< Хэш проекта
      checksum256 withdraw_hash;                  ///< Уникальный внешний ключ
      name username;                              ///< Имя аккаунта участника, запрашивающего возврат.
      name status = "created"_n;                  ///< Статус взноса-возврата (created | approved | )
      asset amount = asset(0, _root_govern_symbol);      ///< Запрошенная сумма для возврата.
      document return_statement;                  ///< Заявление на возврат паевого взноса деньгами
      
      document approved_return_statement;         ///< Принятое председателем заявление на возврат взноса деньгами
      
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
      document return_statement;                  ///< Заявление на возврат паевого взноса деньгами
      
      document approved_return_statement;         ///< Принятое председателем заявление на возврат взноса деньгами
      
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

}