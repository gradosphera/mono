/**
 * @brief Миграция данных контракта.
 * Обновляет счетчики активных пайщиков для всех кооперативов
 * @ingroup public_actions
 * @ingroup public_registrator_actions
 * @anchor registrator_migrate
 * @note Авторизация требуется от аккаунта: @p registrator
 */
[[eosio::action]] void registrator::migrate() {
  require_auth(_registrator);
  
  // Получаем таблицу кооперативов
  cooperatives2_index coops2(_registrator, _registrator.value);
  
  // Для каждого кооператива проверяем наличие счетчика активных пайщиков
  for (auto coop_itr = coops2.begin(); coop_itr != coops2.end(); ++coop_itr) {
    // Если счетчик активных пайщиков уже установлен, пропускаем кооператив
    if (coop_itr->active_participants_count.has_value()) {
      continue;
    }
    
    // Получаем имя кооператива для использования как scope
    eosio::name coopname = coop_itr->username;
    
    // Получаем таблицу участников из контракта soviet с scope кооператива
    participants_index participants(_soviet, coopname.value);
    
    // Счетчик активных пайщиков
    uint64_t active_count = 0;
    
    // Проходим по всем участникам и считаем активных (has_vote == true)
    for (auto part_it = participants.begin(); part_it != participants.end(); ++part_it) {
      if (part_it->has_vote) {
        active_count++;
      }
    }
    
    // Обновляем запись кооператива, устанавливая счетчик активных пайщиков
    coops2.modify(coop_itr, _registrator, [&](auto& coop) {
      coop.active_participants_count = active_count;
    });
  }
}