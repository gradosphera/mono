/**
 * @brief Удаление персонала из кооператива
 * Удаляет члена персонала из кооператива, лишая его всех прав и доступа к системе.
 * @param coopname Наименование кооператива
 * @param chairman Наименование председателя совета
 * @param username Наименование удаляемого члена персонала
 * @ingroup public_actions
 * @ingroup public_soviet_actions
 * @anchor soviet_rmstaff
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