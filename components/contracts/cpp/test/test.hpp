#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;

class [[eosio::contract("test")]] test : public contract {
public:
  using contract::contract;

  /**
   * @brief Тестовая таблица для проверки множественных обновлений
   */
  struct [[eosio::table]] testrecord {
    uint64_t id;
    uint64_t counter;
    uint64_t value;
    std::string status;

    uint64_t primary_key() const { return id; }
  };

  typedef eosio::multi_index<"testrecords"_n, testrecord> testrecords_index;

  /**
   * @brief Тестирует множественные обновления одной записи
   */
  [[eosio::action]]
  void testmultimod(uint64_t record_id);

  /**
   * @brief Очищает тестовые данные
   */
  [[eosio::action]]
  void clear();

  /**
   * @brief Инициализирует тестовую запись
   */
  [[eosio::action]]
  void init(uint64_t record_id);
};
