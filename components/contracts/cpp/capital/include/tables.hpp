#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;

struct bonus_result {
    int64_t creators_bonus;
    int64_t authors_bonus;
    int64_t generated;
    int64_t participants_bonus;
    int64_t total;
};


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

  document statement;                          ///< Служебная записка
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
    name status = "created"_n;                   ///< Статус коммита (created | withdrawed | converted)
    checksum256 project_hash;                    ///< Хэш проекта, связанного с действием.
    checksum256 result_hash;                     ///< Хэш результата, связанного с действием.
    checksum256 commit_hash;                     ///< Хэш действия.
    uint64_t contributed_hours;              ///< Сумма временных затрат, связанная с действием.
    eosio::asset spend;                          ///< Сумма затрат, связанная с действием.
    
    document specification;                          ///< Техническое задание (спецификация) как приложение к договору УХД
    document approved_specification;                 ///< Одобрение председателя или доверенного лица
    document authorization;                          ///< Решение совета
    
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
    document statement;                         ///< Заявление на зачёт из кошелька.
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
  * \ingroup public_tables
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] contributor {
    uint64_t id;                                ///< Уникальный идентификатор участника.
    name coopname;                              ///< Имя аккаунта кооператива.
    name username;                              ///< Имя аккаунта участника.
    checksum256 project_hash;                   ///< Идентификатор проекта.
    name status;                                ///< created | approved | authorized | blocked
    time_point_sec created_at;                  ///< Дата заключения договора УХД
    document agreement;                         ///< Договор УХД с подписью пайщика
    document approved_agreement;                ///< Договор УХД с подписью председателя
    document authorization;                     ///< Протокол решения совета

    eosio::asset invested = asset(0, _root_govern_symbol);   ///< Сколько денег инвестировано
    
    uint64_t contributed_hours;                 ///< Количество вложенных часов в результаты проекта
    eosio::asset rate_per_hour;                          ///< Текущая ставка в час
    eosio::asset spend = asset(0, _root_govern_symbol);  ///< Сколько ресурсов потрачено по ставке
        
    uint64_t convert_percent;                   ///< Процент конвертации в программу (100 0000 MAX)
    eosio::asset for_convert = asset(0, _root_govern_symbol); ///< Сколько ресурсов из spend конвертируем в ЦПП "Капитализация"
    
    eosio::asset available = asset(0, _root_govern_symbol); ///< Сколько средств от результатов доступно для быстрого возврата
    eosio::asset withdrawed = asset(0, _root_govern_symbol);  ///< Сколько ресурсов было возвращено на баланс ЦПП "Цифровой Кошелёк"
    eosio::asset converted = asset(0, _root_govern_symbol);        ///< Cколько средств сконвертировано в баланс ЦПП "Кпитализация"
    
    eosio::asset expensed = asset(0, _root_govern_symbol);        ///< Cколько средств использовано как расход (подписки, сервисы, и т.д.)
    
    uint64_t primary_key() const { return id; } ///< Основной ключ.
    uint64_t by_username() const { return username.value; } ///< Индекс по имени аккаунта.
    checksum256 by_project() const { return project_hash; } ///< Индекс по проекту.
    uint128_t by_project_user() const { return combine_checksum_ids(project_hash, username); } ///< Комбинированный индекс.
    
};

typedef eosio::multi_index<
    "contributors"_n, contributor,
    indexed_by<"byusername"_n, const_mem_fun<contributor, uint64_t, &contributor::by_username>>,
    indexed_by<"byproject"_n, const_mem_fun<contributor, checksum256, &contributor::by_project>>,
    indexed_by<"byprojuser"_n, const_mem_fun<contributor, uint128_t, &contributor::by_project_user>>
> contributor_index; ///< Таблица для хранения участников.


/**
  * @brief Таблица идей
  * 
  */
struct [[eosio::table, eosio::contract(CAPITAL)]] project {
    uint64_t id;
    checksum256 project_hash;
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
    double global_distribution_ratio = 1;     ///< Доля всех пайщиков кооператитива против доли локальных инвесторов проекта (1 - всё уходит всем, 0 - всё уходит локалам)
    
    eosio::asset target = asset(0, _root_govern_symbol);     ///< Целевая сумма финансирования проекта
    eosio::asset invested = asset(0, _root_govern_symbol);   ///< Сколько средств вошло (инвестиции)
    eosio::asset available = asset(0, _root_govern_symbol);  ///< Сколько средств доступно для перевода в результаты
    eosio::asset allocated = asset(0, _root_govern_symbol);  ///< Сколько средств аллоцировано в результаты
    eosio::asset expensed = asset(0, _root_govern_symbol);   ///< Cколько средств использовано как расход (подписки, сервисы, и т.д.)
    eosio::asset spend = asset(0, _root_govern_symbol);      ///< Сколько средств потрачено на возвраты создателям
    eosio::asset generated = asset(0, _root_govern_symbol);  ///< Сколько результатов интеллектуальной деятельности сгенерировано

    
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
    eosio::name status = "created"_n; ///< created | started | expired?
    
    eosio::name coopname;
    time_point_sec created_at = current_time_point();
    time_point_sec expired_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch() + 365 * 86400);
    uint64_t authors_shares;
    uint64_t authors_count;
    
    uint64_t commits_count;
    eosio::asset allocated = asset(0, _root_govern_symbol); ///< аллоцированные на создание результата средства
    eosio::asset available = asset(0, _root_govern_symbol); ///< зарезерированные на создание результата средства
    eosio::asset spend = asset(0, _root_govern_symbol); ///< фактически потраченные ресурсы на создание результат в виде времени (паевые взносы-возвраты)
    eosio::asset expensed = asset(0, _root_govern_symbol); ///< фактически потраченные на создание результата средства в виде расходов (подписки, прочее)
    
    eosio::asset creators_amount = asset(0, _root_govern_symbol); ///< себестоимость РИД
    eosio::asset creators_bonus = asset(0, _root_govern_symbol); ///< премии создателей - 0.382 от себестоимости (creators_amount)
    eosio::asset authors_bonus = asset(0, _root_govern_symbol);  ///< премии авторов - 1.618 от себестоимости (creators_amount)
    eosio::asset generated_amount = asset(0, _root_govern_symbol); ///< стоимость РИД с учётом премий авторов и создателей
    eosio::asset participants_bonus = asset(0, _root_govern_symbol); ///< премии пайщиков кооператива - 1.618 от generated_amount
    
    eosio::asset total_amount = asset(0, _root_govern_symbol); ///< Капитализация РИД  (стоимость РИД в generated_amount + participants_bonus)

    eosio::asset participants_bonus_remain = asset(0, _root_govern_symbol); ///< сумма остатка для выплаты пайщикам

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
    checksum256 claim_hash;
    checksum256 project_hash;
    checksum256 result_hash;
    
    eosio::name coopname;
    eosio::name owner;

    eosio::name type; ///< intellectual | property
    eosio::name status = "created"_n; ///< created | statement | decision | act1 | act2 | completed
    time_point_sec created_at = current_time_point();

    eosio::asset amount = asset(0, _root_govern_symbol);

    document statement; ///< Заявление
    document decision; ///< Решение
    document act1; ///< Акт передачи
    document act2; ///< Акт приёма

    uint64_t primary_key() const { return id; }     ///< Основной ключ.
    uint64_t by_owner() const { return owner.value; } ///< Индекс по владельцу
    checksum256 by_hash() const { return claim_hash; } ///< Индекс по хэшу
    checksum256 by_result_hash() const { return result_hash; } ///< Индекс по хэшу
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу идеи    
    
    uint128_t by_result_user() const {
        return combine_checksum_ids(result_hash, owner);
    }
};

  typedef eosio::multi_index<"claims"_n, claim,
    indexed_by<"byowner"_n, const_mem_fun<claim, uint64_t, &claim::by_owner>>,
    indexed_by<"byhash"_n, const_mem_fun<claim, checksum256, &claim::by_hash>>,
    indexed_by<"byresulthash"_n, const_mem_fun<claim, checksum256, &claim::by_result_hash>>,
    indexed_by<"byprojecthash"_n, const_mem_fun<claim, checksum256, &claim::by_project_hash>>,
    indexed_by<"byresuser"_n, const_mem_fun<claim, uint128_t, &claim::by_result_user>>
  > claim_index;


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
  
  struct [[eosio::table, eosio::contract(CAPITAL)]] withdraw {
      uint64_t id;                                ///< Уникальный ID запроса на вывод.
      name coopname;                              ///< Имя аккаунта кооператива
      checksum256 project_hash;                    ///< Хэш проекта
      checksum256 result_hash;                    ///< Хэш результата
      checksum256 withdraw_hash;                  ///< Уникальный внешний ключ
      name username;                              ///< Имя аккаунта участника, запрашивающего вывод.
      name status = "created"_n;                  ///< Статус взноса-возврата (created | approved | )
      std::vector<checksum256> commit_hashes;     ///< Погашаемые коммиты
      asset amount = asset(0, _root_govern_symbol);      ///< Запрошенная сумма для вывода.
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

    typedef eosio::multi_index<"withdraws"_n, withdraw,
      indexed_by<"byhash"_n, const_mem_fun<withdraw, checksum256, &withdraw::by_hash>>,
      indexed_by<"byusername"_n, const_mem_fun<withdraw, uint64_t, &withdraw::by_account>>,
      indexed_by<"bycreated"_n, const_mem_fun<withdraw, uint64_t, &withdraw::by_created>>
    > withdraws_index; ///< Таблица для хранения запросов на вывод.

}