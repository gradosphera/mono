/**
 * @brief Отклоняет приложение к договору УХД
 * Отклоняет приложение к договору УХД и удаляет его из базы:
 * - Проверяет существование приложения
 * - Удаляет приложение из базы данных с указанием причины
 * @param coopname Наименование кооператива
 * @param appendix_hash Хеш приложения к договору
 * @param reason Причина отклонения приложения
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_dclineappndx
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::dclineappndx(eosio::name coopname, checksum256 appendix_hash, std::string reason) {
  require_auth(_soviet);
  
  // Находим приложение
  auto appendix = Capital::Appendix::get_appendix(coopname, appendix_hash);
  
  // Удаляем приложение
  if (appendix.has_value()) {
    Capital::Appendix::delete_appendix(coopname, appendix -> id);
  }
} 