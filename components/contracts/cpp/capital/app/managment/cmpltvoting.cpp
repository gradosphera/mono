void capital::cmpltvoting(name coopname, checksum256 project_hash) {
  require_auth(coopname); // или DAO, если голосование автоматическое
  
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  eosio::check(project.status == Capital::Projects::Status::VOTING, "Проект должен быть в статусе 'voting'");
  
  // Обновляем статус проекта на "completed"
  Capital::Projects::update_status(coopname, project_hash, Capital::Projects::Status::COMPLETED);
}