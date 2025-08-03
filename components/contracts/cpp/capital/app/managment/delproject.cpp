void capital::delproject(name coopname, checksum256 project_hash) {
  require_auth(coopname);
  
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  eosio::check(project.status == Capital::Projects::Status::VOTING, "Проект должен быть в статусе 'voting'");
  
  //TODO: delete project with check that we are delete everything related to it
}