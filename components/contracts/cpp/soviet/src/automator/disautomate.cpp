
/**
 * @brief Отключение автоматизации подписи на решениях
 * Позволяет члену совета удалить настройку автоматической подписи на решениях по определенным типам вопросов.
 * @param coopname Наименование кооператива
 * @param board_id Идентификатор совета кооператива
 * @param member Наименование члена совета, который удаляет автоматизацию
 * @param automation_id Идентификатор автоматизации для удаления
 * @ingroup public_actions
 * @ingroup public_soviet_actions
 * @anchor soviet_disautomate
 * @note Авторизация требуется от аккаунта: @p member
 */
void soviet::disautomate(eosio::name coopname, uint64_t board_id, eosio::name member, uint64_t automation_id ) {
  require_auth(member);

  automator_index automator(_soviet, coopname.value);
  auto autom = automator.find(automation_id);
  eosio::check(autom -> board_id == board_id, "Указан неверный идентификатор совета");
  eosio::check(autom -> member == member, "Это не ваша автоматизация для удаления");

  automator.erase(autom);
}

