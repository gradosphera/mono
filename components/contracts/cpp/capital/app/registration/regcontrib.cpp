/**
 * @brief Регистрация пайщика в контракте и получение договора УХД от него.
 */
void capital::regcontrib(eosio::name coopname, eosio::name application, eosio::name username, checksum256 project_hash, uint64_t convert_percent, eosio::asset rate_per_hour, time_point_sec created_at, document2 agreement) {
  check_auth_or_fail(_capital, coopname, application, "regcontrib"_n);
  
  verify_document_or_fail(agreement);
  
  auto exist = Capital::get_contributor(coopname, project_hash, username);
  eosio::check(!exist.has_value(), "Пайщик уже обладает подписанным договором УХД по проекту");
  
  auto project = Capital::get_project(coopname, project_hash);
  eosio::check(project.has_value(), "Проект с указанным хэшем не найден");

  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor = contributors.find(exist -> id);
   
  contributors.emplace(coopname, [&](auto &c) {
    c.id = get_global_id_in_scope(_capital, coopname, "contributors"_n);
    c.coopname = coopname;
    c.username = username;
    c.status = "created"_n;
    c.project_hash = project_hash;
    c.agreement = agreement;
    c.created_at = created_at;
    c.convert_percent = convert_percent;
    c.rate_per_hour = rate_per_hour;
  });
};