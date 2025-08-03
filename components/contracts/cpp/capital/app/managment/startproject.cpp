void capital::startproject(name coopname, checksum256 project_hash) {
    require_auth(coopname);
    
    // Проверяем существование проекта и получаем его
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Проверяем, что проект в статусе "opened"
    eosio::check(project.status == Capital::Projects::Status::OPENED, "Проект должен быть в статусе 'opened'");
    
    // Обновляем статус проекта на "active"
    Capital::Projects::update_status(coopname, project_hash, Capital::Projects::Status::ACTIVE);
} 