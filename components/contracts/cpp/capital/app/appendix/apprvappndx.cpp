void capital::apprvappndx(eosio::name coopname, checksum256 appendix_hash, document2 approved_document) {
  require_auth(_soviet);
  
  // Находим приложение
  auto appendix = Capital::get_appendix(coopname, appendix_hash);
  eosio::check(appendix.has_value(), "Приложение не найдено");
  eosio::check(appendix -> status == "created"_n, "Приложение уже обработано");
  
  Capital::appendix_index appendixes(_capital, coopname.value);
  auto itr = appendixes.find(appendix -> id);
  
  // Находим контрибьютора с основным договором УХД
  auto contributor = Capital::get_contributor(coopname, appendix -> username);
  eosio::check(contributor.has_value(), "Контрибьютор с основным договором УХД не найден");
  
  // Добавляем project_hash в вектор appendixes у контрибьютора
  Capital::contributor_index contributors(_capital, coopname.value);
  auto contributor_itr = contributors.find(contributor -> id);
  
  contributors.modify(contributor_itr, _capital, [&](auto &c) {
    c.appendixes.push_back(appendix -> project_hash);
  });
  
  // Удаляем запись из таблицы appendixes
  appendixes.erase(itr);
} 