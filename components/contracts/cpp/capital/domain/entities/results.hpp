#pragma once

using namespace eosio;
using std::string;

namespace Capital::Results::Status {

  /**
   * @brief Константы статусов результата
   */
    const eosio::name CREATED = "created"_n;     ///< Заявление подано
    const eosio::name APPROVED = "approved"_n;       ///< Одобрено председателем
    const eosio::name AUTHORIZED = "authorized"_n;   ///< Авторизовано советом
    const eosio::name DECLINED = "declined"_n;       ///< Отклонено советом
    const eosio::name ACT1 = "act1"_n;              ///< Первый акт подписан
    const eosio::name ACT2 = "act2"_n;              ///< Второй акт подписан
  
} // namespace Capital::Results::Status


namespace Capital {

struct [[eosio::table, eosio::contract(CAPITAL)]] result {
  uint64_t id;
  checksum256 project_hash;
  checksum256 result_hash;
  
  eosio::name coopname;
  eosio::name username;

  eosio::name status = Capital::Results::Status::CREATED; ///< created | approved | authorized | declined | act1 | act2
  time_point_sec created_at = current_time_point();

  eosio::asset creator_base_amount = asset(0, _root_govern_symbol);
  eosio::asset author_base_amount = asset(0, _root_govern_symbol);
  eosio::asset debt_amount = asset(0, _root_govern_symbol);
  
  eosio::asset creator_bonus_amount = asset(0, _root_govern_symbol);
  eosio::asset author_bonus_amount = asset(0, _root_govern_symbol);
  eosio::asset generation_amount = asset(0, _root_govern_symbol);
  eosio::asset capitalist_bonus_amount = asset(0, _root_govern_symbol);
  
  eosio::asset total_amount = asset(0, _root_govern_symbol);
  eosio::asset available_for_return = asset(0, _root_govern_symbol);
  eosio::asset available_for_convert = asset(0, _root_govern_symbol);
      
  document2 statement; ///< Заявление
  document2 authorization; ///< Решение совета
  document2 act; ///< Акт
  
  uint64_t primary_key() const { return id; }     ///< Основной ключ.
  uint64_t by_username() const { return username.value; } ///< Индекс по владельцу
  checksum256 by_hash() const { return result_hash; } ///< Индекс по хэшу результата
  checksum256 by_project_hash() const { return project_hash; } ///< Индекс по хэшу проекта
  
  uint128_t by_project_user() const {
      return combine_checksum_ids(project_hash, username);
  }
};

typedef eosio::multi_index<"results"_n, result,
  indexed_by<"byusername"_n, const_mem_fun<result, uint64_t, &result::by_username>>,
  indexed_by<"byhash"_n, const_mem_fun<result, checksum256, &result::by_hash>>,
  indexed_by<"byprojecthash"_n, const_mem_fun<result, checksum256, &result::by_project_hash>>,
  indexed_by<"byprojuser"_n, const_mem_fun<result, uint128_t, &result::by_project_user>>
> result_index;


namespace Results {

inline std::optional<result> get_result(eosio::name coopname, const checksum256 &result_hash) {
  result_index results(_capital, coopname.value);
  auto idx = results.get_index<"byhash"_n>();
  
  auto it = idx.find(result_hash);
  if (it == idx.end()) {
      return std::nullopt;
  }
  return *it;
}

inline std::optional<result> get_result_by_project_and_username(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
  result_index results(_capital, coopname.value);
  auto idx = results.get_index<"byprojuser"_n>();
  auto rkey = combine_checksum_ids(project_hash, username);

  auto it = idx.find(rkey);
  if (it == idx.end()) {
      return std::nullopt;
  }
  return *it;
}

inline result get_result_by_project_and_username_or_fail(eosio::name coopname, const checksum256 &project_hash, eosio::name username, const char* msg) {
  auto c = get_result_by_project_and_username(coopname, project_hash, username);
  eosio::check(c.has_value(), msg);
  return *c;
}

/**
 * @brief Создает результат для конкретного участника
 */
inline void create_result_for_participant(eosio::name coopname, const checksum256 &project_hash, 
                                         eosio::name username, const checksum256 &result_hash,
                                         eosio::asset segment_cost, eosio::asset debt_amount, const document2 &statement) {
    result_index results(_capital, coopname.value);
    
    // Проверяем, что результат ещё не создан
    auto existing = get_result_by_project_and_username(coopname, project_hash, username);
    eosio::check(!existing.has_value(), "Результат уже создан для данного участника");
    
    results.emplace(_capital, [&](auto &r) {
        r.id = results.available_primary_key();
        r.project_hash = project_hash;
        r.result_hash = result_hash;
        r.coopname = coopname;
        r.username = username;
        r.status = Capital::Results::Status::CREATED; 
        r.total_amount = segment_cost;
        r.debt_amount = debt_amount;
        r.statement = statement;
        r.created_at = current_time_point();
    });
}


/**
 * @brief Удаляет объект результата и возвращает статус сегмента в ready
 */
inline void delete_result_and_reset_segment(eosio::name coopname, const checksum256 &project_hash, 
                                           eosio::name username) {
    // Удаляем объект результата
    auto result_opt = get_result_by_project_and_username(coopname, project_hash, username);
    if (result_opt.has_value()) {
        result_index results(_capital, coopname.value);
        auto result_itr = results.find(result_opt->id);
        results.erase(result_itr);
    }
    
    // Возвращаем статус сегмента в ready
    Capital::Segments::update_segment_status(coopname, project_hash, username, Capital::Segments::Status::READY);
}

/**
 * @brief Удаляет объект результата после успешного принятия
 */
inline void delete_result(eosio::name coopname, const checksum256 &project_hash, 
                                          eosio::name username) {
    auto result_opt = get_result_by_project_and_username(coopname, project_hash, username);
    if (result_opt.has_value()) {
        result_index results(_capital, coopname.value);
        auto result_itr = results.find(result_opt->id);
        results.erase(result_itr);
    }
}

/**
 * @brief Обновляет статус результата
 */
inline void update_result_status(eosio::name coopname, const checksum256 &result_hash, eosio::name new_status) {
    auto exist_result = get_result(coopname, result_hash);
    eosio::check(exist_result.has_value(), "Объект результата не найден");

    result_index results(_capital, coopname.value);
    auto result = results.find(exist_result->id);

    results.modify(result, _capital, [&](auto &r){
        r.status = new_status;
    });
}

/**
 * @brief Устанавливает документ авторизации результата
 */
inline void set_result_authorization(eosio::name coopname, const checksum256 &result_hash, const document2 &authorization) {
    auto exist_result = get_result(coopname, result_hash);
    eosio::check(exist_result.has_value(), "Объект результата не найден");

    result_index results(_capital, coopname.value);
    auto result = results.find(exist_result->id);

    results.modify(result, _capital, [&](auto &r){
        r.authorization = authorization;
    });
}

/**
 * @brief Устанавливает одобренное заявление результата
 */
inline void set_result_approved_statement(eosio::name coopname, const checksum256 &result_hash, const document2 &approved_statement, eosio::name payer) {
    auto exist_result = get_result(coopname, result_hash);
    eosio::check(exist_result.has_value(), "Объект результата не найден");

    result_index results(_capital, coopname.value);
    auto result = results.find(exist_result->id);

    results.modify(result, payer, [&](auto &r){
        r.statement = approved_statement;
    });
}

/**
 * @brief Устанавливает первый акт результата
 */
inline void set_result_act1(eosio::name coopname, const checksum256 &result_hash, const document2 &act) {
    auto exist_result = get_result(coopname, result_hash);
    eosio::check(exist_result.has_value(), "Объект результата не найден");

    result_index results(_capital, coopname.value);
    auto result = results.find(exist_result->id);

    results.modify(result, _capital, [&](auto &r){
        r.act = act;
    });
}

/**
 * @brief Устанавливает второй акт результата
 */
inline void set_result_act2(eosio::name coopname, const checksum256 &result_hash, const document2 &act) {
    auto exist_result = get_result(coopname, result_hash);
    eosio::check(exist_result.has_value(), "Объект результата не найден");

    result_index results(_capital, coopname.value);
    auto result = results.find(exist_result->id);

    results.modify(result, _capital, [&](auto &r){
        r.act = act;
    });
}

/**
 * @brief Отправляет результат на рассмотрение в совет
 */
inline void send_result_to_soviet(eosio::name coopname, eosio::name username, const checksum256 &result_hash, const document2 &approved_statement) {
    ::Soviet::create_agenda(
        _capital,
        coopname, 
        username, 
        Names::SovietActions::CREATE_RESULT, 
        result_hash,
        _capital, 
        Names::Capital::AUTHORIZE_RESULT, 
        Names::Capital::DECLINE_RESULT, 
        approved_statement, 
        std::string("")
    );
}

} // namespace Results

} // namespace Capital
