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
  // возврата (p.reg.refund). Деньги уже получены кассой и стоят на расчётах
  // с пайщиком (w.reg.pend, счёт 76). Сжигаем суспенс обратной проводкой
  // Dr 76 / Cr 51: деньги уходят из системы банковским переводом кандидату
  // (его инициирует бэкенд по событию отказа). Сумма = вступительный + минимальный паевой.
  eosio::asset registration_quantity = candidate -> initial + candidate -> minimum;
  if (registration_quantity.amount > 0) {
    std::string memo = "Возврат регистрационного взноса при отказе совета, username=" + candidate -> username.to_string();
    Ledger2::apply(_registrator, coopname, operations::registrator::REFUND, registration_quantity, candidate -> username, registration_hash, memo);
  }

  // Кандидат отклонён — удаляем из картотеки кандидатов.
  Registrator::candidates_index candidates(_registrator, coopname.value);
  auto it = candidates.find(candidate -> username.value);
  if (it != candidates.end()) candidates.erase(it);
}