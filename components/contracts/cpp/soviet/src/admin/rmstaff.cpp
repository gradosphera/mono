/**
\ingroup public_actions
\brief Удаление персонала из кооператива
*
* Данный метод позволяет удалить члена персонала из кооператива. 
* Авторизация для выполнения этого метода требуется только от председателя совета кооператива.
*
* @param coopname Имя кооператива
* @param board_id ID совета кооператива
* @param chairman Имя председателя совета
* @param username Имя удаляемого члена персонала
* 
* @note Авторизация требуется от аккаунта: @p chairman
*/
void soviet::rmstaff(eosio::name coopname, eosio::name chairman, eosio::name username) {
  require_auth(chairman);

  staff_index staff(_soviet, coopname.value);
  
  auto board = get_board_by_type_or_fail(coopname, "soviet"_n);
  eosio::check(board.is_valid_chairman(chairman), "Только председатель кооператива может удалять персонал");

  auto persona = staff.find(username.value);
  eosio::check(persona != staff.end(), "Персона не найдена");

  staff.erase(persona);

};