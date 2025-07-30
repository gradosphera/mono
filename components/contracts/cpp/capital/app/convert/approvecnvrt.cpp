void capital::approvecnvrt(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 convert_hash, document2 approved_statement){
  check_auth_or_fail(_capital, coopname, application, "approvecnvrt"_n);
  
  verify_document_or_fail(approved_statement);
  
  auto exist_convert = Capital::get_convert(coopname, convert_hash);
  eosio::check(exist_convert.has_value(), "Конвертация пользователя для задананиеа не найдена");
  Capital::convert_index converts(_capital, coopname.value);
  
  auto convert = converts.find(exist_convert -> id);
  
  auto assignment = Capital::get_assignment(coopname, convert -> assignment_hash);
  eosio::check(assignment.has_value(), "Задание не найдено");
  
  // добавляем доли актору и отмечаем статистику сконвертированных сумм
  auto contributor = Capital::get_active_contributor_with_appendix_or_fail(coopname, assignment -> project_hash, convert -> username);
  
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor_for_modify = contributors.find(contributor -> id);
  
  contributors.modify(contributor_for_modify, coopname, [&](auto &c){
    c.converted += convert -> convert_amount;
    c.share_balance += convert -> convert_amount;
  });
  
  // добавляем доли в проект
  auto exist = Capital::get_project(coopname, convert -> project_hash);
  eosio::check(exist.has_value(),"Проект не найден");
  Capital::project_index projects(_capital, coopname.value);
  auto project = projects.find(exist -> id);
  
  projects.modify(project, coopname, [&](auto &p) {
    p.converted += convert -> convert_amount;
    p.total_share_balance += convert -> convert_amount;
  });
  
  std::string memo = "Зачёт части целевого паевого взноса по договору УХД с ID: " + std::to_string(contributor -> id) + " в качестве паевого взноса по программе 'Капитализация' с ID: " + std::to_string(convert -> id);
  
  //Списываем баланс средств с УХД только при наличии convert_amount в result
  Wallet::sub_blocked_funds(_capital, coopname, convert -> username, convert -> convert_amount, _source_program, memo);
  
  //Увеличиваем баланс средств в капитализации
  Wallet::add_blocked_funds(_capital, coopname, convert -> username, convert -> convert_amount, _capital_program, memo);
  
  // удаляем объект конвертации
  converts.erase(convert);  
  
};