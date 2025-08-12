void capital::openproject(name coopname, checksum256 project_hash) {
    require_auth(coopname);
    
    // Проверяем существование проекта и получаем его
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
    // Проверяем, что проект в статусе "created"
    eosio::check(project.is_opened == false, "Проект уже открыт");
    
    // Открываем проект через доменную логику
    Capital::Projects::open_project(coopname, project_hash);
} 