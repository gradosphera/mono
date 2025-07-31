#pragma once

using namespace eosio;
using std::string;


namespace Capital {
/**
  * @brief Структура инвестиций, хранящая данные о вложениях в проекты.
  * \ingroup public_tables
  */
  struct [[eosio::table, eosio::contract(CAPITAL)]] invest {
    uint64_t id;                                ///< Уникальный идентификатор инвестиции.
    name coopname;                              ///< Имя аккаунта кооператива.
    name username;                              ///< Имя аккаунта инвестора.
    checksum256 invest_hash;                           ///< Хэш идентификатор объекта инвестиции.
    checksum256 project_hash;                   ///< Хэш идентификатора проекта.    
    eosio::asset amount = asset(0, _root_govern_symbol); ///< Сумма инвестиции.
    name status;                                ///< created | signed | authorized | blocked
    time_point_sec invested_at;                 ///< Дата приёма инвестиции.
    document2 statement;                         ///< Заявление на зачёт из кошелька.
    
    // Координаторская информация
    eosio::name coordinator;                    ///< Имя координатора (реферера), если есть.
    eosio::asset coordinator_amount = asset(0, _root_govern_symbol); ///< Сумма координаторского взноса.
    
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

} // namespace Capital

namespace Capital::Invests {

inline std::optional<invest> get_invest(eosio::name coopname, const checksum256 &invest_hash) {
  invest_index invests(_capital, coopname.value);
  auto invest_hash_index = invests.get_index<"byhash"_n>();

  auto invest_itr = invest_hash_index.find(invest_hash);
  if (invest_itr == invest_hash_index.end()) {
      return std::nullopt;
  }

  return *invest_itr;
}

/**
 * @brief Получает инвестицию по хэшу или прерывает выполнение с ошибкой.
 * @param coopname Имя кооператива (scope таблицы).
 * @param invest_hash Хэш инвестиции.
 * @return Инвестицию или прерывает выполнение.
 */
inline invest get_invest_or_fail(eosio::name coopname, const checksum256 &invest_hash) {
  auto investment = get_invest(coopname, invest_hash);
  eosio::check(investment.has_value(), "Инвестиция не найдена");
  return *investment;
}


/**
 * @brief Вычисляет сумму координаторского взноса, если инвестор зарегистрирован менее 30 дней назад.
 * @param investor_username Имя инвестора.
 * @param investment_amount Сумма инвестиции.
 * @return Пара: имя координатора и сумма координаторского взноса (или nullopt если условия не выполнены).
 */
 inline std::optional<std::pair<eosio::name, eosio::asset>> get_coordinator_amount(
  eosio::name investor_username, 
  const eosio::asset &investment_amount
) {
  auto investor_account = get_account_or_fail(investor_username);
  
  // Проверяем, есть ли координатор (реферер)
  if (investor_account.referer == eosio::name{}) {
      return std::nullopt;
  }
  
  // Проверяем, зарегистрирован ли инвестор менее 30 дней назад
  auto current_time = eosio::current_time_point();
  auto registration_time = investor_account.registered_at;
  
  auto time_since_registration = current_time.sec_since_epoch() - registration_time.sec_since_epoch();
  
  if (time_since_registration >= THIRTY_DAYS_IN_SECONDS) {
      return std::nullopt;
  }
  
  // Возвращаем координатора и сумму координаторского взноса (равную сумме инвестиции)
  return std::make_pair(investor_account.referer, investment_amount);
}

/**
 * @brief Создает инвестицию и отправляет её на утверждение.
 * @param coopname Имя кооператива.
 * @param username Имя пользователя инвестора.
 * @param project_hash Хэш проекта.
 * @param invest_hash Хэш инвестиции.
 * @param amount Сумма инвестиции.
 * @param statement Заявление на инвестицию.
 */
inline void create_invest_with_approve(
  eosio::name coopname,
  eosio::name username,
  checksum256 project_hash,
  checksum256 invest_hash,
  eosio::asset amount,
  document2 statement
) {
  // Создаем инвестицию
  invest_index invests(_capital, coopname.value);
  uint64_t invest_id = get_global_id_in_scope(_capital, coopname, "invests"_n);
  
  invests.emplace(coopname, [&](auto &i){
    i.id = invest_id;
    i.coopname = coopname;
    i.username = username;
    i.project_hash = project_hash;
    i.invest_hash = invest_hash;
    i.status = "created"_n;
    i.invested_at = current_time_point();
    i.statement = statement;
    i.amount = amount;
  });
  
  // Отправляем на approve председателю
  Action::send<createapprv_interface>(
    _soviet,
    "createapprv"_n,
    _capital,
    coopname,
    username,
    statement,
    ApprovesNames::Capital::CREATE_INVESTMENT,
    invest_hash,
    _capital,
    "approveinvst"_n,
    "declineinvst"_n,
    std::string("")
  );
}

/**
 * @brief Устанавливает информацию о координаторе в инвестиции.
 * @param coopname Имя кооператива.
 * @param invest_hash Хэш инвестиции.
 * @param coordinator_username Имя координатора.
 * @param coordinator_amount Сумма координатора.
 */
inline void set_coordinator_info(
  eosio::name coopname,
  checksum256 invest_hash,
  eosio::name coordinator_username,
  eosio::asset coordinator_amount
) {
  invest_index invests(_capital, coopname.value);
  auto invest_hash_index = invests.get_index<"byhash"_n>();
  auto invest_iterator = invest_hash_index.find(invest_hash);
  
  eosio::check(invest_iterator != invest_hash_index.end(), "Инвестиция не найдена");
  
  // Обновляем запись с информацией о координаторе
  invest_hash_index.modify(invest_iterator, coopname, [&](auto &i){
    i.coordinator = coordinator_username;
    i.coordinator_amount = coordinator_amount;
  });
}

/**
 * @brief Удаляет инвестицию по хэшу.
 * @param coopname Имя кооператива (scope таблицы).
 * @param invest_hash Хэш инвестиции.
 */
inline void delete_invest(eosio::name coopname, const checksum256 &invest_hash) {
  invest_index invests(_capital, coopname.value);
  auto invest_hash_index = invests.get_index<"byhash"_n>();

  auto itr = invest_hash_index.find(invest_hash);
  eosio::check(itr != invest_hash_index.end(), "Инвестиция не найдена");

  invests.erase(*itr);
}


} // namespace Capital::Invests