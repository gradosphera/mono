/**
 * @brief Отклонение собрания советом.
 * Отклоняет проведение собрания и удаляет его из системы
 * @param coopname Наименование кооператива
 * @param hash Хэш собрания
 * @param reason Причина отклонения собрания
 * @ingroup public_actions
 * @ingroup public_meet_actions
 * @anchor meet_declmeet
 * @note Авторизация требуется от аккаунта: @p soviet
 */
void meet::declmeet(name coopname, checksum256 hash, std::string reason) {
  require_auth(_soviet);
  
  auto exist_meet = get_meet(coopname, hash);
  
  if (exist_meet.has_value()) {
    Meet::meets_index genmeets(_meet, coopname.value);
    auto genmeet = genmeets.find(exist_meet -> id);
    genmeets.erase(genmeet);    
  };
   
};
