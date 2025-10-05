#pragma once

using namespace eosio;
using std::string;

namespace Capital {

  /**
   * @brief Таблица участников хранит данные индивидуального участника кооператива.
   * @ingroup public_tables
   * @ingroup public_capital_tables

   * @par Область памяти (scope): coopname
   * @par Имя таблицы (table): contributors 
   */
  struct [[eosio::table, eosio::contract(CAPITAL)]] contributor {
    uint64_t id;                                    ///< ID контрибьютора (внутренний ключ)
    name coopname;                                  ///< Имя кооператива
    name username;                                  ///< Имя пользователя
    checksum256 contributor_hash;                   ///< Внешний идентификатор контрибьютора
    time_point_sec created_at;                      ///< Время создания контрибьютора
    name status;                                    ///< Статус контрибьютора
    std::string memo;                                ///< Мемо для импортированных контрибьюторов
    bool is_external_contract = false;              ///< Флаг, указывающий на внешний контракт
    document2 contract;                             ///< Договор УХД
    std::vector<checksum256> appendixes;            ///< Вектор хэшей проектов, для которых подписаны приложения
    
    eosio::asset rate_per_hour = asset(0, _root_govern_symbol); ///< Ставка за час
    uint64_t hours_per_day = 0; ///< Часы в день
    eosio::asset debt_amount = asset(0, _root_govern_symbol);   ///< Сумма долга
    
    eosio::asset contributed_as_investor = asset(0, _root_govern_symbol);     ///< Сумма, вложенная в проект как инвестор
    eosio::asset contributed_as_creator = asset(0, _root_govern_symbol);      ///< Сумма, вложенная в проект как создатель
    eosio::asset contributed_as_author = asset(0, _root_govern_symbol);       ///< Сумма, вложенная в проект как автор
    eosio::asset contributed_as_coordinator = asset(0, _root_govern_symbol);  ///< Сумма, вложенная в проект как координатор
    eosio::asset contributed_as_contributor = asset(0, _root_govern_symbol);  ///< Сумма, вложенная в проект как контрибьютор
    eosio::asset contributed_as_propertor = asset(0, _root_govern_symbol);    ///< Сумма, вложенная в проект как пропертор
    
    uint64_t primary_key() const { return id; }                  ///< Первичный ключ (1)
    uint64_t by_username() const { return username.value; }      ///< Индекс по имени пользователя (2)
    checksum256 by_hash() const { return contributor_hash; }     ///< Индекс по хэшу контрибьютора (3)
    uint64_t by_investor_rating() const { return contributed_as_investor.amount; }     ///< Индекс по рейтингу инвестора (4)
    uint64_t by_creator_rating() const { return contributed_as_creator.amount; }       ///< Индекс по рейтингу создателя (5)
    uint64_t by_author_rating() const { return contributed_as_author.amount; }         ///< Индекс по рейтингу автора (6)
    uint64_t by_coordinator_rating() const { return contributed_as_coordinator.amount; } ///< Индекс по рейтингу координатора (7)
    uint64_t by_contributor_rating() const { return contributed_as_contributor.amount; } ///< Индекс по рейтингу контрибьютора (8)
    uint64_t by_propertor_rating() const { return contributed_as_propertor.amount; }     ///< Индекс по рейтингу пропертора (9)
    uint64_t by_rating() const { return contributed_as_investor.amount + contributed_as_creator.amount + contributed_as_author.amount + contributed_as_coordinator.amount + contributed_as_contributor.amount + contributed_as_propertor.amount; } ///< Индекс по общему рейтингу (10)
  };

typedef eosio::multi_index<
    "contributors"_n, contributor,
    indexed_by<"byusername"_n, const_mem_fun<contributor, uint64_t, &contributor::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<contributor, checksum256, &contributor::by_hash>>,
    indexed_by<"byinvrate"_n, const_mem_fun<contributor, uint64_t, &contributor::by_investor_rating>>,
    indexed_by<"bycreatorate"_n, const_mem_fun<contributor, uint64_t, &contributor::by_creator_rating>>,
    indexed_by<"byauthorate"_n, const_mem_fun<contributor, uint64_t, &contributor::by_author_rating>>,
    indexed_by<"bycoordrate"_n, const_mem_fun<contributor, uint64_t, &contributor::by_coordinator_rating>>,
    indexed_by<"bycontrate"_n, const_mem_fun<contributor, uint64_t, &contributor::by_contributor_rating>>,
    indexed_by<"byprprate"_n, const_mem_fun<contributor, uint64_t, &contributor::by_propertor_rating>>,
    indexed_by<"byrating"_n, const_mem_fun<contributor, uint64_t, &contributor::by_rating>>
> contributor_index;
}// namespace Capital

namespace Capital::Contributors {

  /**
   * @brief Константы статусов контрибьюторов
   * @ingroup public_consts
   * @ingroup public_capital_consts

   */
  namespace Status {
    const eosio::name PENDING = "pending"_n;       ///< Ожидает подтверждения
    const eosio::name ACTIVE = "active"_n; ///< Авторизован/активен
  }
  
  inline void create_contributor(eosio::name coopname, eosio::name username, checksum256 contributor_hash, bool is_external_contract, document2 contract, eosio::asset rate_per_hour, uint64_t hours_per_day){
    Capital::contributor_index contributors(_capital, coopname.value);
   
    contributors.emplace(coopname, [&](auto &c) {
      c.id = get_global_id_in_scope(_capital, coopname, "contributors"_n);
      c.coopname = coopname;
      c.username = username;
      c.contributor_hash = contributor_hash;
      c.status = Capital::Contributors::Status::PENDING;
      c.is_external_contract = is_external_contract;
      c.contract = contract;
      c.created_at = eosio::current_time_point();
      c.rate_per_hour = rate_per_hour;
      c.hours_per_day = hours_per_day;
    });
  }
  
  
  inline void import_contributor(eosio::name coopname, eosio::name username, checksum256 contributor_hash, std::string memo){
    Capital::contributor_index contributors(_capital, coopname.value);
   
    contributors.emplace(coopname, [&](auto &c) {
      c.id = get_global_id_in_scope(_capital, coopname, "contributors"_n);
      c.coopname = coopname;
      c.username = username;
      c.contributor_hash = contributor_hash;
      c.status = Capital::Contributors::Status::ACTIVE;
      c.is_external_contract = true;
      c.created_at = eosio::current_time_point();
      c.memo = memo;
      c.rate_per_hour = asset(0, _root_govern_symbol);
      c.hours_per_day = 0;
    });
  }
  
  
  /**
   * @brief Добавляет project_hash в вектор appendixes у контрибьютора
   */
  inline void push_appendix_to_contributor(eosio::name coopname, eosio::name username, checksum256 project_hash){
    contributor_index contributors(_capital, coopname.value);
    auto username_index = contributors.get_index<"byusername"_n>();

    auto itr = username_index.find(username.value);
    
    username_index.modify(*itr, _capital, [&](auto &c) {
      c.appendixes.push_back(project_hash);
    });
  }

  /**
  * @brief Получает участника по имени аккаунта.
  */
  inline std::optional<contributor> get_contributor(eosio::name coopname, eosio::name username) {
    contributor_index contributors(_capital, coopname.value);
    auto username_index = contributors.get_index<"byusername"_n>();

    auto itr = username_index.find(username.value);
    if (itr == username_index.end()) {
        return std::nullopt;
    }

    return *itr;
  }




/**
 * @brief Получает участника по хэшу контрибьютора.
 */
 inline std::optional<contributor> get_contributor_by_hash(eosio::name coopname, const checksum256& contributor_hash) {
  contributor_index contributors(_capital, coopname.value);
  auto hash_index = contributors.get_index<"byhash"_n>();

  auto itr = hash_index.find(contributor_hash);
  if (itr == hash_index.end()) {
      return std::nullopt;
  }

  return *itr;
}


/**
* @brief Проверяет есть ли у контрибьютора приложение для проекта
*/
inline bool is_contributor_has_appendix_in_project(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
  auto contributor = get_contributor(coopname, username);
  if (!contributor.has_value()) {
      return false;
  }
  
  // Проверяем есть ли project_hash в векторе appendixes
  for (const auto& appendix_project_hash : contributor->appendixes) {
      if (appendix_project_hash == project_hash) {
          return true;
      }
  }
  
  return false;
}


/**
* @brief Получает участника по имени аккаунта и проверяет на активность.
*/
inline std::optional<contributor> get_active_contributor_or_fail(eosio::name coopname, eosio::name username) {
  auto contributor = get_contributor(coopname, username);
  eosio::check(contributor.has_value(), "Создатель не подписывал договор УХД");
  eosio::check(contributor -> status == Status::ACTIVE, "Договор УХД с пайщиком не активен");
  return contributor;
}


/**
* @brief Получает участника по имени аккаунта, проверяет активность и членство в проекте.
*/
inline std::optional<contributor> get_active_contributor_with_appendix_or_fail(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
  auto contributor = get_active_contributor_or_fail(coopname, username);
  eosio::check(is_contributor_has_appendix_in_project(coopname, project_hash, username), 
               "Пайщик не подписывал приложение к договору УХД для данного проекта");
  return contributor;
}

/**
* @brief Обновляет накопительные показатели контрибьютора на основе его ролей и вкладов в сегменте
*/
inline void update_contributor_ratings_from_segment(eosio::name coopname, const Capital::Segments::segment& segment) {
  Capital::contributor_index contributors(_capital, coopname.value);
  auto username_index = contributors.get_index<"byusername"_n>();

  auto itr = username_index.find(segment.username.value);
  
  eosio::check(itr != username_index.end(), "Контрибьютор не найден");
  
  username_index.modify(itr, _capital, [&](auto &c) {
    if (segment.is_investor) {
      c.contributed_as_investor += segment.investor_base;
    }
    
    if (segment.is_author) {
      c.contributed_as_author += (segment.author_base + segment.author_bonus);
    }
    
    if (segment.is_creator) {
      c.contributed_as_creator += (segment.creator_base + segment.creator_bonus);
    }
    
    if (segment.is_coordinator) {
      c.contributed_as_coordinator += segment.coordinator_base;
    }
    
    if (segment.is_contributor) {
      c.contributed_as_contributor += segment.contributor_bonus;
    }
    
    if (segment.is_propertor) {
      c.contributed_as_propertor += segment.property_base;
    }
  });
}

/**
 * @brief Увеличивает долг контрибьютора
 */
inline void increase_debt_amount(eosio::name coopname, eosio::name username, eosio::asset amount) {
  contributor_index contributors(_capital, coopname.value);
  auto username_index = contributors.get_index<"byusername"_n>();
  auto contributor_itr = username_index.find(username.value);
  
  //TODO: make coopname payer
  username_index.modify(contributor_itr, _capital, [&](auto &c) {
    c.debt_amount += amount;
  });
}

/**
 * @brief Увеличивает долг контрибьютора
 */
 inline void decrease_debt_amount(eosio::name coopname, eosio::name username, eosio::asset amount) {
  contributor_index contributors(_capital, coopname.value);
  auto username_index = contributors.get_index<"byusername"_n>();
  auto contributor_itr = username_index.find(username.value);

  eosio::check(contributor_itr->debt_amount >= amount, "Недостаточно долга для погашения");

  //TODO: make coopname payer
  username_index.modify(contributor_itr, _capital, [&](auto &c) {
    c.debt_amount -= amount;
  });
}

/**
 * @brief Обновляет параметры вкладчика (часы в день и информацию о себе)
 */
inline void edit_contributor(eosio::name coopname, eosio::name username, eosio::asset rate_per_hour, uint64_t hours_per_day) {
  contributor_index contributors(_capital, coopname.value);
  auto username_index = contributors.get_index<"byusername"_n>();
  auto contributor_itr = username_index.find(username.value);

  eosio::check(contributor_itr != username_index.end(), "Вкладчик не найден");

  username_index.modify(contributor_itr, coopname, [&](auto &c) {
    c.rate_per_hour = rate_per_hour;
    c.hours_per_day = hours_per_day;
  });
}

}// namespace Capital::Contributors