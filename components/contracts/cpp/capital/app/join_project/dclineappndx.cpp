void capital::dclineappndx(eosio::name coopname, checksum256 appendix_hash, std::string reason) {
  require_auth(_soviet);
  
  // Находим приложение
  auto appendix = Capital::Appendix::get_appendix(coopname, appendix_hash);
  
  // Удаляем приложение
  if (appendix.has_value()) {
    Capital::Appendix::delete_appendix(coopname, appendix -> id);
  }
} 