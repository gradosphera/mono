/**
 * @brief Уменьшает счетчик активных пайщиков кооператива
 * @param coopname Имя кооператива
 * @param username Имя пайщика
 */
void registrator::decparticpnt(eosio::name coopname, eosio::name username)
{
  // Проверка авторизации - может вызывать только контракт soviet
  require_auth(_soviet);
  
  // Получаем информацию о кооперативе
  cooperatives2_index cooperatives(_registrator, _registrator.value);
  auto coop_itr = cooperatives.find(coopname.value);
  
  if (coop_itr != cooperatives.end() && coop_itr->is_cooperative) {
    if (coop_itr->active_participants_count.has_value() && coop_itr->active_participants_count.value() > 0) {
      // Уменьшаем счетчик только если он больше нуля
      cooperatives.modify(coop_itr, _registrator, [&](auto &coop) {
        coop.active_participants_count = coop.active_participants_count.value() - 1;
      });
    }
  }
} 