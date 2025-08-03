void capital::rfrshsegment(eosio::name coopname, checksum256 project_hash, eosio::name username) {
  require_auth(username);
  
  // Проверяем существование проекта
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  // Обновляем сегмент участника через CRPS систему
  Capital::Core::refresh_segment(coopname, project_hash, username);
} 