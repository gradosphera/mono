void capital::closeproject(name coopname, checksum256 project_hash) {
  require_auth(coopname);
  
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  eosio::check(project.status == Capital::Projects::Status::COMPLETED, "Проект должен быть в статусе 'completed'");
  
  Capital::Projects::update_status(coopname, project_hash, Capital::Projects::Status::CLOSED);
}