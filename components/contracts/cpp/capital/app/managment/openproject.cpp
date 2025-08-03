void capital::openproject(name coopname, checksum256 project_hash) {
    require_auth(coopname);
    
    // Проверяем существование проекта и получаем его
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Проверяем, что проект в статусе "created"
    eosio::check(project.status == Capital::Projects::Status::CREATED, "Проект должен быть в статусе 'created'");
    
    // Обновляем статус проекта на "opened"
    Capital::Projects::update_status(coopname, project_hash, Capital::Projects::Status::OPENED);
} 