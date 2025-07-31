using namespace eosio;
using std::string;

namespace Capital {

struct [[eosio::table, eosio::contract(CAPITAL)]] expense {
  uint64_t id;                                 ///< Уникальный идентификатор действия.
  name coopname;                               ///< Имя кооператива.
  name application;                            ///< Приложение, инициировавшее расход.
  name username;                               ///< Имя пользователя, создавшего расход.
  
  name status = "created"_n;                   ///< Статус расхода (created | approved | authorized)
  checksum256 project_hash;                    ///< Хэш проекта, связанного с расходом.
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
  checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта.

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