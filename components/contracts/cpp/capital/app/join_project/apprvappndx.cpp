void capital::apprvappndx(eosio::name coopname, checksum256 appendix_hash, document2 approved_document) {
  require_auth(_soviet);
  
  // Находим приложение
  auto appendix = Capital::Appendix::get_appendix(coopname, appendix_hash);
  eosio::check(appendix.has_value(), "Приложение не найдено");
  eosio::check(appendix -> status == Capital::Appendix::Status::CREATED, "Приложение уже обработано");
  
  // Находим контрибьютора с основным договором УХД
  auto contributor = Capital::Contributors::get_contributor(coopname, appendix -> username);
  eosio::check(contributor.has_value(), "Контрибьютор с основным договором УХД не найден");
  
  // Добавляем проект в вектор appendixes у контрибьютора
  Capital::Contributors::push_appendix_to_contributor(coopname, appendix -> username, appendix -> project_hash);
  
  // Удаляем приложение
  Capital::Appendix::delete_appendix(coopname, appendix -> id);
} 