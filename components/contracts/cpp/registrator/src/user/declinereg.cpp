#include "registration_migration.hpp"

/**
 * @brief Отклонение регистрации пользователя.
 * Отклоняет регистрацию кандидата советом
 * @param coopname Наименование кооператива
 * @param registration_hash Хэш регистрации
 * @param reason Причина отклонения регистрации
 * @ingroup public_actions
 * @ingroup public_registrator_actions

 * @note Авторизация требуется от аккаунта: @p soviet
 */
void registrator::declinereg(name coopname, checksum256 registration_hash, std::string reason) {
  require_auth(_soviet);

  auto candidate = Registrator::get_candidate_by_hash(coopname, registration_hash);
  eosio::check(candidate.has_value(), "Кандидат не найден");

  // Совет отказал — процесс приёма взноса прерывается, начинается процесс
  // возврата (p.reg.refund). Сжигаем суспенс обратной проводкой Dr 76 / Cr 51:
  // деньги уходят из системы банковским переводом кандидату (его инициирует
  // бэкенд по событию отказа).
  //
  // MIGRATION (снять условие после 30.07.2026, см. registration_migration.hpp):
  // возврат через ledger2 делаем только если платёж принят по новому пути —
  // есть баланс на w.reg.pend (счёт 76). Кандидаты, принятые ДО релиза, суспенса
  // не имеют: для них on-chain проводки возврата нет (как было раньше), деньги
  // возвращает бэкенд банковским переводом. Сжигаем фактический остаток на
  // w.reg.pend — он равен полученной сумме (вступительный + минимальный паевой).
  eosio::asset pending = Registrator::get_registration_pending_balance(coopname, candidate -> username);
  if (pending.amount > 0) {
    std::string memo = "Возврат регистрационного взноса при отказе совета, username=" + candidate -> username.to_string();
    Ledger2::apply(_registrator, coopname, operations::registrator::REFUND, pending, candidate -> username, registration_hash, memo);
  }

  // Кандидат отклонён — удаляем из картотеки кандидатов.
  Registrator::candidates_index candidates(_registrator, coopname.value);
  auto it = candidates.find(candidate -> username.value);
  if (it != candidates.end()) candidates.erase(it);
}