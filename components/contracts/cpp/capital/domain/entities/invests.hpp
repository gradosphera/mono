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
    name application;                           ///< Имя аккаунта приложения.
    name username;                              ///< Имя аккаунта инвестора.
    checksum256 invest_hash;                           ///< Хэш идентификатор объекта инвестиции.
    checksum256 project_hash;                   ///< Хэш идентификатора проекта.    
    eosio::asset amount = asset(0, _root_govern_symbol); ///< Сумма инвестиции.
    name status;                                ///< created | signed | authorized | blocked
    time_point_sec invested_at;                 ///< Дата приёма инвестиции.
    document2 invest_statement;                         ///< Заявление на зачёт из кошелька.
    document2 approved_statement;              ///< Подпись председателя на принятом заявлении. 
    
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


inline std::optional<invest> get_invest(eosio::name coopname, const checksum256 &invest_hash) {
  invest_index invests(_capital, coopname.value);
  auto invest_hash_index = invests.get_index<"byhash"_n>();

  auto invest_itr = invest_hash_index.find(invest_hash);
  if (invest_itr == invest_hash_index.end()) {
      return std::nullopt;
  }

  return *invest_itr;
}

}