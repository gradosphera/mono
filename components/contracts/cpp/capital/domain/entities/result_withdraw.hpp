#pragma once

using namespace eosio;
using std::string;

namespace Capital {

/**
  * @brief Структура запроса на взнос результата.
  */
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


inline std::optional<result_withdraw> get_result_withdraw(eosio::name coopname, const checksum256 &hash) {
  result_withdraws_index result_withdraws(_capital, coopname.value);
  auto index = result_withdraws.get_index<"byhash"_n>();

  auto itr = index.find(hash);
  
  if (itr == index.end()) {
      return std::nullopt;
  }

  return *itr;
}

} // namespace Capital