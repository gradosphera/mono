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
  auto exist_commit = Capital::get_commit(coopname, commit_hash);
  eosio::check(!exist_commit.has_value(), "Действие с указанным хэшем уже существует");
  
  // Проверяем, что сумма часов создателя больше 0
  eosio::check(creator_hours > 0, "Только положительная сумма часов создателя");
  
  // считаем сумму фактических затрат создателя на основе ставки в час и потраченного времени
  eosio::asset creator_base = contributor -> rate_per_hour * creator_hours;
  
  // Вычисляем фактические показатели через сервис
  auto calculated_fact = Capital::Core::calculate_fact_generation_amounts(contributor -> rate_per_hour, creator_hours);
  
  // Создаем коммит
  Capital::commit_index commits(_capital, coopname.value);
  auto commit_id = get_global_id_in_scope(_capital, coopname, "commits"_n);
  
  // Создаем коммит в таблице commits
  commits.emplace(coopname, [&](auto &c) {
    c.id = commit_id;
    c.status = "created"_n;
    c.coopname = coopname;
    c.application = application;
    c.username = username;
    c.project_hash = project_hash;
    c.commit_hash = commit_hash;
    c.creator_hours = creator_hours;
    c.rate_per_hour = contributor -> rate_per_hour;
    c.creator_base = creator_base;
    c.amounts = calculated_fact;
    c.created_at = current_time_point();
  });

  // Создаем пустой документ
  auto empty_doc = document2{};
  
  //отправить на approve председателю
  Action::send<createapprv_interface>(
    _soviet,
    "createapprv"_n,
    _capital,
    coopname,
    username,
    empty_doc,
    ApprovesNames::Capital::CREATE_COMMIT,
    commit_hash,
    _capital,
    "approvecmmt"_n,
    "declinecmmt"_n,
    std::string("")
  );

}