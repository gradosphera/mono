void capital::cmpltproject(name coopname, checksum256 project_hash) {
  require_auth(coopname);
  
  // Проверяем существование проекта и получаем его
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
  // Проверяем, что проект в статусе "active"
  eosio::check(project.status == Capital::Projects::Status::ACTIVE, "Проект должен быть в статусе 'active'");
  
  // Обновляем статус проекта на "voting"
  Capital::Projects::update_status(coopname, project_hash, Capital::Projects::Status::VOTING);
  
  // Инициализируем голосование по методу Водянова
  Capital::Core::Voting::initialize_project_voting(coopname, project_hash);
} 