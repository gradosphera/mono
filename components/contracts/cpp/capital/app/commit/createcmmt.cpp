void capital::createcmmt(eosio::name coopname, eosio::name application, eosio::name username, checksum256 project_hash, checksum256 commit_hash, uint64_t creator_hours){
  require_auth(coopname);
  
  // Проверяем существование проекта и получаем его
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
  // Проверяем, что проект в статусе "active"
  eosio::check(project.status == Capital::Projects::Status::ACTIVE, "Проект должен быть в статусе 'active'");
  
  // Проверяем основной договор УХД
  auto contributor = Capital::Contributors::get_contributor(coopname, username);
  eosio::check(contributor.has_value(), "Пайщик не подписывал основной договор УХД");
  eosio::check(contributor -> status == Capital::Contributors::Status::ACTIVE, "Основной договор УХД не активен");
  
  // Проверяем приложение к проекту
  eosio::check(Capital::Contributors::is_contributor_has_appendix_in_project(coopname, project_hash, username), 
               "Пайщик не подписывал приложение к договору УХД для данного проекта");
  
  // Проверяем, что действие с указанным хэшем не существует
  Capital::Commits::get_commit_or_fail(coopname, commit_hash);
  
  // Проверяем, что сумма часов создателя больше 0
  eosio::check(creator_hours > 0, "Только положительная сумма часов создателя");
  
  // считаем сумму фактических затрат создателя на основе ставки в час и потраченного времени
  eosio::asset creator_base = contributor -> rate_per_hour * creator_hours;
  
  // Вычисляем фактическое изменение сумм генерации
  auto delta_amounts = Capital::Core::Generation::calculate_fact_generation_amounts(contributor -> rate_per_hour, creator_hours);
  
  // Создаем коммит и отправляем на approve
  Capital::Commits::create_commit_with_approve(
    coopname,
    application,
    username,
    project_hash,
    commit_hash,
    delta_amounts
  );

}