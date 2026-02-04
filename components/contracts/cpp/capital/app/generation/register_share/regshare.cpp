/**
 * @brief Добавляет участника в проект через CRPS систему
 * Добавляет участника в проект через систему CRPS с автоматическими проверками:
 * - Проверяет существование проекта
 * - Выполняет проверки через CRPS систему (активный договор УХД, приложение к проекту, положительный баланс)
 * - Добавляет участника через CRPS систему
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта
 * @param username Наименование пользователя-участника
 * @param user_shares Баланс пользователя в целевой потребительской программе
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p _capital
 */
void capital::regshare(eosio::name coopname, checksum256 project_hash, eosio::name username, eosio::asset user_shares) {
  require_auth(_capital);
  
  // Проверяем существование проекта
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);

  auto check_appendix = Capital::Contributors::get_active_contributor_with_appendix_or_fail(coopname, project_hash, username);

  // Проверяем наличие сегмента
  auto exist_segment = Capital::Segments::get_segment(coopname, project_hash, username);
  
  uint64_t segment_id = 0;
  if (exist_segment.has_value()) {
    // Проверяем что пользователь не зарегистрирован в проекте как участник
    eosio::check(!exist_segment -> is_contributor, "Участник уже зарегистрирован в проекте");
    segment_id = exist_segment.value().id;
  } else {
    segment_id = Capital::Segments::get_segment_id(coopname);
  }
  
  // Добавляем участника
  Capital::Core::upsert_contributor_segment(coopname, segment_id, project, username, user_shares);
} 