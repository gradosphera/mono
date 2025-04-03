
/**
\ingroup public_actions
\brief Удаление настройки автоматизации подписи
*
* Этот метод позволяет члену совета удалить настройку автоматизации подписи на решениях по определенным типам вопросов. 
*
* @param coopname Имя кооператива
* @param board_id ID совета кооператива
* @param member Имя члена совета, который удаляет автоматизацию
* @param automation_id Идентификатор автоматизации для удаления
* 
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

