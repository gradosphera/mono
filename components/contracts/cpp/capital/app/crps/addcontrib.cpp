void capital::addcontrib(eosio::name coopname, checksum256 project_hash, eosio::name username) {
  require_auth(username);
  
  // Проверяем существование проекта
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  // Добавляем вкладчика через CRPS систему
  // Функция сама выполнит все необходимые проверки:
  // - наличие активного договора УХД
  // - наличие подписанного приложения к проекту
  // - положительный баланс в программе капитализации
  Capital::Core::upsert_contributor_segment(coopname, project_hash, username);
} 