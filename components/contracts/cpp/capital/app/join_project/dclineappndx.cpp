void capital::dclineappndx(eosio::name coopname, checksum256 appendix_hash, std::string reason) {
  require_auth(_soviet);
  
  // Находим приложение
  auto appendix = Capital::get_appendix(coopname, appendix_hash);
  eosio::check(appendix.has_value(), "Приложение не найдено");
  eosio::check(appendix -> status == Capital::Appendix::Status::CREATED, "Приложение уже обработано");
  
  Capital::appendix_index appendixes(_capital, coopname.value);
  auto itr = appendixes.find(appendix -> id);
  
  // Удаляем запись из таблицы appendixes - приложение отклонено
  appendixes.erase(itr);
} 