/**
 * @brief Обновляет энергию участника с учетом естественного снижения
 * Применяет decay к энергии участника на основе прошедшего времени:
 * - Проверяет авторизацию кооператива
 * - Получает текущее состояние участника
 * - Рассчитывает количество дней с последнего обновления
 * - Применяет decay согласно настроенной скорости
 * - Обновляет энергию и время последнего обновления
 * @param coopname Имя кооператива
 * @param username Имя участника для обновления
 * @ingroup public_actions
 * @ingroup public_capital_actions
 *
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::refreshcontr(eosio::name coopname, eosio::name username) {
  require_auth(coopname);
  
  // Проверяем существование активного участника
  auto contributor = Capital::Contributors::get_active_contributor_or_fail(coopname, username);

  // Обновляем энергию с учетом decay
  Capital::Gamification::update_energy_with_decay(coopname, contributor->id);
}

