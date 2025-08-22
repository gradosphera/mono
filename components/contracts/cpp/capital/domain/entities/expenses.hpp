#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;
using std::string;

namespace Capital::Expenses {
  /**
   * @brief Константы статусов расходов
   * @ingroup public_consts
   * @ingroup public_capital_consts

   */
   namespace Status {
    const eosio::name CREATED = "created"_n;        ///< Расход создан
    const eosio::name APPROVED = "approved"_n;      ///< Расход одобрен председателем
    const eosio::name AUTHORIZED = "authorized"_n;  ///< Расход авторизован советом
    const eosio::name PAID = "paid"_n;             ///< Расход оплачен
    const eosio::name DECLINED = "declined"_n;      ///< Расход отклонен
  }
}

namespace Capital {

  /**
   * @brief Таблица расходов хранит информацию о расходах проектов кооператива.
   * @ingroup public_tables
   * @ingroup public_capital_tables

   * @par Область памяти (scope): coopname
   * @par Имя таблицы (table): expenses 
   */
  struct [[eosio::table, eosio::contract(CAPITAL)]] expense {
    uint64_t id;                                    ///< ID расхода (внутренний ключ)
    name coopname;                                  ///< Имя кооператива
    name username;                                  ///< Имя пользователя, создавшего расход
    
    name status = Expenses::Status::CREATED;        ///< Статус расхода (created | approved | authorized | paid | declined)
    checksum256 project_hash;                       ///< Хэш проекта, связанного с расходом
    checksum256 expense_hash;                       ///< Хэш расхода
    uint64_t fund_id;                               ///< Идентификатор фонда списания (expfunds в контакте fund)
    eosio::asset amount;                            ///< Сумма расхода
    std::string description;                        ///< Публичное описание расхода

    document2 expense_statement;                    ///< Служебная записка
    document2 approved_statement;                   ///< Принятая записка председателем или доверенным
    document2 authorization;                        ///< Утвержденная записка советом
                                  
    time_point_sec spended_at = current_time_point(); ///< Дата и время создания расхода

    uint64_t primary_key() const { return id; }     ///< Первичный ключ (1)
    uint64_t by_username() const { return username.value; } ///< Индекс по имени пользователя (2)
    checksum256 by_expense_hash() const { return expense_hash; } ///< Индекс по хэшу расхода (3)
    checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта (4)
  };

  typedef eosio::multi_index<
    "expenses"_n, expense,
    indexed_by<"byusername"_n, const_mem_fun<expense, uint64_t, &expense::by_username>>,
    indexed_by<"byhash"_n, const_mem_fun<expense, checksum256, &expense::by_expense_hash>>,
    indexed_by<"byprojhash"_n, const_mem_fun<expense, checksum256, &expense::by_project_hash>>
  > expense_index;


/**
 * @brief Получает расход по хэшу.
 * @param coopname Имя кооператива (scope таблицы).
 * @param hash Хэш расхода.
 * @return `std::optional<expense>` - найденное действие или `std::nullopt`, если его нет.
 */
 inline std::optional<expense> get_expense(eosio::name coopname, const checksum256 &hash) {
  expense_index expenses(_capital, coopname.value);
  auto expense_index = expenses.get_index<"byhash"_n>();

  auto itr = expense_index.find(hash);
  if (itr == expense_index.end()) {
      return std::nullopt;
  }

  return *itr;
}

} // namespace Capital

namespace Capital::Expenses {


  /**
   * @brief Получает расход по хэшу или вызывает ошибку.
   * @param coopname Имя кооператива.
   * @param expense_hash Хэш расхода.
   * @return expense - найденный расход.
   */
  inline expense get_expense_or_fail(eosio::name coopname, const checksum256 &expense_hash) {
    auto expense = Capital::get_expense(coopname, expense_hash);
    eosio::check(expense.has_value(), "Расход с указанным хэшем не найден");
    return *expense;
  }

  /**
   * @brief Создает запись расхода в таблице.
   * @param coopname Имя кооператива.
   * @param project_hash Хэш проекта.
   * @param expense_hash Хэш расхода.
   * @param username Создатель расхода.
   * @param amount Сумма расхода.
   * @param description Описание.
   * @param statement Служебная записка.
   */
  inline void create_expense(eosio::name coopname, const checksum256 &project_hash, 
                            const checksum256 &expense_hash, eosio::name username, 
                            const eosio::asset &amount,
                            const std::string &description, const document2 &statement) {
    
    Capital::expense_index expenses(_capital, coopname.value);
    uint64_t expense_id = get_global_id_in_scope(_capital, coopname, "expenses"_n);
    
    expenses.emplace(coopname, [&](auto &e) {
      e.id = expense_id;
      e.coopname = coopname;
      e.username = username;
      e.project_hash = project_hash;
      e.expense_hash = expense_hash;
      e.fund_id = Ledger::accounts::ECONOMIC_ACTIVITY_FUND;
      e.status = Expenses::Status::CREATED;
      e.spended_at = current_time_point();
      e.expense_statement = statement;
      e.amount = amount;
      e.description = description;
    });
  }

  /**
   * @brief Обновляет статус расхода.
   * @param coopname Имя кооператива.
   * @param expense_hash Хэш расхода.
   * @param new_status Новый статус.
   */
  inline void update_status(eosio::name coopname, const checksum256 &expense_hash, eosio::name new_status) {
    auto exist_expense = get_expense_or_fail(coopname, expense_hash);
    
    Capital::expense_index expenses(_capital, coopname.value);
    auto expense = expenses.find(exist_expense.id);
    
    expenses.modify(expense, coopname, [&](auto &e) {
      e.status = new_status;
    });
  }

  /**
   * @brief Обновляет статус и одобренную записку расхода.
   * @param coopname Имя кооператива.
   * @param expense_hash Хэш расхода.
   * @param approved_statement Одобренная записка.
   */
  inline void set_approved(eosio::name coopname, const checksum256 &expense_hash, 
                          const document2 &approved_statement) {
    auto exist_expense = get_expense_or_fail(coopname, expense_hash);
    
    Capital::expense_index expenses(_capital, coopname.value);
    auto expense = expenses.find(exist_expense.id);
    
    expenses.modify(expense, coopname, [&](auto &e) {
      e.status = Expenses::Status::APPROVED;
      e.approved_statement = approved_statement;
    });
  }

  /**
   * @brief Обновляет статус и авторизацию расхода.
   * @param coopname Имя кооператива.
   * @param expense_hash Хэш расхода.
   * @param authorization Документ авторизации.
   */
  inline void set_authorized(eosio::name coopname, const checksum256 &expense_hash, 
                            const document2 &authorization) {
    auto exist_expense = get_expense_or_fail(coopname, expense_hash);
    
    Capital::expense_index expenses(_capital, coopname.value);
    auto expense = expenses.find(exist_expense.id);
    
    expenses.modify(expense, coopname, [&](auto &e) {
      e.status = Expenses::Status::AUTHORIZED;
      e.authorization = authorization;
    });
  }

  /**
   * @brief Удаляет запись расхода из таблицы.
   * @param coopname Имя кооператива.
   * @param expense_hash Хэш расхода.
   */
  inline void delete_expense(eosio::name coopname, const checksum256 &expense_hash) {
    auto exist_expense = get_expense_or_fail(coopname, expense_hash);
    
    Capital::expense_index expenses(_capital, coopname.value);
    auto expense = expenses.find(exist_expense.id);
    expenses.erase(expense);
  }

} // namespace Capital::Expenses