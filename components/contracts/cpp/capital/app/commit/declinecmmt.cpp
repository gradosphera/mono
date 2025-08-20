/**
 * @brief Отклоняет коммит в проект
 * Отклоняет коммит и удаляет его из базы данных:
 * - Получает коммит
 * - Удаляет коммит из базы данных с указанием причины
 * @param coopname Наименование кооператива
 * @param commit_hash Хеш коммита для отклонения
 * @param reason Причина отклонения коммита
 * @ingroup public_actions
 * @ingroup public_capital_actions
 * @anchor capital_declinecmmt
 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::declinecmmt(eosio::name coopname, checksum256 commit_hash, std::string reason) {
  require_auth(_soviet);
  
  auto commit = Capital::Commits::get_commit_or_fail(coopname, commit_hash);
  
  Capital::Commits::delete_commit(coopname, commit_hash);
}
